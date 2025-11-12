import { DataSource, In } from "typeorm";
import { Claim } from "../../entities/Claim";
import {
    CreateClaimDTO,
    DeleteClaimDTO,
    DeleteClaimResponse,
    GetClaimsByCompanyIdResponse,
    CreateClaimResponse,
    LinkClaimToLineItemDTO,
    LinkClaimToLineItemResponse,
    LinkClaimToPurchaseDTO,
    LinkClaimToPurchaseResponse,
    GetPurchaseLineItemsForClaimResponse,
    DeletePurchaseLineItemResponse,
    GetClaimInProgressForCompanyResponse,
} from "../../types/Claim";
import { logMessageToFile } from "../../utilities/logger";
import { plainToClass } from "class-transformer";
import { ClaimStatusInProgressTypes, ClaimStatusType } from "../../types/ClaimStatusType";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { IPurchaseLineItemTransaction, PurchaseLineItemTransaction } from "../purchase-line-item/transaction";
import { Purchase } from "../../entities/Purchase";
import Boom from "@hapi/boom";

export interface IClaimTransaction {
    /**
     * Creates a new claim in the database
     * @param payload Claim to be inserted into the database
     * @returns A promise that resolves to the created claim or null
     */
    createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse | null>;

    /**
     * Gets a claim by its id
     * @param payload ID of the claim to be fetched
     * @returns Promise resolving to fetched claim or null if not found
     */
    getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse | null>;

    /**
     * Deletes a claim by its id
     * @param payload ID of the claim to be deleted
     * @returns Promise resolving delete operation or null if not present
     */
    deleteClaim(payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse | null>;

    /**
     * Adds a link (row in the bridge table) between a claim and a purchase line item
     *
     * @param payload id of both the claim and the purchase line item
     * @returns Promise resolving to linked claim id and purchase line item id or null if either not found
     */
    linkClaimToLineItem(payload: LinkClaimToLineItemDTO): Promise<LinkClaimToLineItemResponse | null>;

    /**
     * Adds a link (row in the bridge table) between a claim and every line item for a purchase
     *
     * @param payload if of the claim and the purchase whose line items must be linked
     * @returns Promise resolving to an array with objects containing claim id and each linked purchase line
     * item id or null if either not found
     */
    linkClaimToPurchaseItems(payload: LinkClaimToPurchaseDTO): Promise<LinkClaimToPurchaseResponse | null>;

    /**
     * Gets all the linked purchase line items to a claim
     *
     * @param claimId of the desired claim
     * @returns Promise resolving to an array of the linked purchase line items
     */
    getLinkedPurchaseLineItems(claimId: string): Promise<GetPurchaseLineItemsForClaimResponse | null>;

    /**
     * Deletes the link between a purchase line item and a claim
     * @param claimId from the desired claim
     * @param lineItemId from the desired purchase line item
     * @returns Promise resolving to linked claim id and purchase line item id or null if either not found
     */
    deletePurchaseLineItem(claimId: string, lineItemId: string): Promise<DeletePurchaseLineItemResponse | null>;

    /**
     * Gets the most recent Claim that is in progress, if there is one
     * If there are more than one, gets the most recently created one
     * If there are none, returns NULL
     * @param companyId the id of the company to look for
     * @returns either the found Claim or null if none found
     */
    getClaimInProgressForCompany(companyId: string): Promise<GetClaimInProgressForCompanyResponse>;
}

export class ClaimTransaction implements IClaimTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse | null> {
        if (ClaimStatusInProgressTypes.includes(payload.status)) {
            const exists = await this.getClaimInProgressForCompany(companyId);
            if (exists !== null) {
                throw Boom.badRequest("Cannot have more than one claim in progress per company");
            }
        }
        try {
            const claim: Claim = plainToClass(Claim, {
                ...payload,
                companyId: companyId,
            });

            const result: Claim = await this.db.manager.save(Claim, claim);

            return {
                ...result,
                status: result.status as ClaimStatusType,
                createdAt: claim.createdAt.toISOString(),
                updatedAt: claim.updatedAt?.toISOString(),
                femaDisaster: result.femaDisaster
                    ? {
                          ...result.femaDisaster,
                          declarationDate: result.femaDisaster.declarationDate.toISOString(),
                          incidentBeginDate: result.femaDisaster.incidentBeginDate?.toISOString(),
                          incidentEndDate: result.femaDisaster.incidentEndDate?.toISOString(),
                      }
                    : undefined,
                selfDisaster: claim.selfDisaster
                    ? {
                          ...claim.selfDisaster,
                          startDate: claim.selfDisaster.startDate.toISOString(),
                          endDate: claim.selfDisaster.endDate?.toISOString(),
                          createdAt: claim.selfDisaster.createdAt.toISOString(),
                          updatedAt: claim.selfDisaster.updatedAt.toISOString(),
                      }
                    : undefined,
                insurancePolicy: result.insurancePolicy
                    ? {
                          ...result.insurancePolicy,
                          updatedAt: result.insurancePolicy.updatedAt.toISOString(),
                          createdAt: result.insurancePolicy.createdAt.toISOString(),
                      }
                    : undefined,
            };
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse | null> {
        try {
            const companyId = '40fcc7c3-892c-44c9-bc79-0aebb1dd94a0'
            console.log(`Comp ID: ${companyId}`)
            const result: Claim[] = await this.db.getRepository(Claim).find({
                where: { companyId: companyId },
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
                    insurancePolicy: true,
                },
            });

            return result.map((claim) => ({
                id: claim.id,
                status: claim.status,
                createdAt: claim.createdAt.toISOString(),
                updatedAt: claim.updatedAt?.toISOString(),
                companyId: claim.companyId,
                femaDisaster: claim.femaDisaster
                    ? {
                          ...claim.femaDisaster,
                          declarationDate: claim.femaDisaster.declarationDate.toISOString(),
                          incidentBeginDate: claim.femaDisaster.incidentBeginDate?.toISOString() || undefined,
                          incidentEndDate: claim.femaDisaster.incidentEndDate?.toISOString() || undefined,
                      }
                    : undefined,
                selfDisaster: claim.selfDisaster
                    ? {
                          ...claim.selfDisaster,
                          startDate: claim.selfDisaster.startDate.toISOString(),
                          endDate: claim.selfDisaster.endDate?.toISOString(),
                          createdAt: claim.selfDisaster.createdAt.toISOString(),
                          updatedAt: claim.selfDisaster.updatedAt.toISOString(),
                      }
                    : undefined,
                insurancePolicy: claim.insurancePolicy
                    ? {
                          ...claim.insurancePolicy,
                          updatedAt: claim.insurancePolicy.updatedAt.toISOString(),
                          createdAt: claim.insurancePolicy.createdAt.toISOString(),
                      }
                    : undefined,
            }));
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async deleteClaim(payload: DeleteClaimDTO, companyId: string): Promise<DeleteClaimResponse | null> {
        try {
            const result = await this.db.manager.delete(Claim, { id: payload.id, companyId: companyId });
            if (result.affected === 1) {
                return { id: payload.id };
            } else {
                // TypeORM does not throw an error if the enity to be deleted is not found
                logMessageToFile(`Transaction error: claim not found`);
                return null;
            }
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async linkClaimToLineItem(payload: LinkClaimToLineItemDTO): Promise<LinkClaimToLineItemResponse | null> {
        try {
            await this.db.manager
                .createQueryBuilder()
                .relation(Claim, "purchaseLineItems")
                .of(payload.claimId)
                .add(payload.purchaseLineItemId);
            return payload;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async linkClaimToPurchaseItems(payload: LinkClaimToPurchaseDTO): Promise<LinkClaimToPurchaseResponse | null> {
        const purchaseLineItemTransaction: IPurchaseLineItemTransaction = new PurchaseLineItemTransaction(this.db);
        try {
            const lineItems = await purchaseLineItemTransaction.getPurchaseLineItemsForPurchase(payload.purchaseId);

            const lineItemIds = lineItems.map((item) => item.id);

            await this.db.manager
                .createQueryBuilder()
                .relation(Claim, "purchaseLineItems")
                .of(payload.claimId)
                .add(lineItemIds);

            const result = lineItemIds.map((id) => ({
                claimId: payload.claimId,
                purchaseLineItemId: id,
            }));

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getLinkedPurchaseLineItems(claimId: string): Promise<GetPurchaseLineItemsForClaimResponse | null> {
        try {
            const claim = await this.db.manager.findOne(Claim, {
                where: { id: claimId },
            });

            if (!claim) {
                return null;
            }

            const lineItems = await this.db.manager
                .createQueryBuilder(PurchaseLineItem, "lineItem")
                // this is needed because the claim-line item link is unilateral
                .innerJoin("claim_purchase_line_items", "bridge", "bridge.purchaseLineItemId = lineItem.id")
                .where("bridge.claimId = :claimId", { claimId })
                .getMany();

            return lineItems.map((item) => ({
                ...item,
                dateCreated: item.dateCreated.toISOString(),
                lastUpdated: item.lastUpdated.toISOString(),
                quickbooksDateCreated: item.quickbooksDateCreated?.toISOString(),
            }));
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async deletePurchaseLineItem(claimId: string, lineItemId: string): Promise<DeletePurchaseLineItemResponse | null> {
        try {
            const claim = await this.db.manager.findOne(Claim, { where: { id: claimId } });
            const lineItem = await this.db.manager.findOne(PurchaseLineItem, { where: { id: lineItemId } });

            if (!claim || !lineItem) {
                return null;
            }

            await this.db.manager
                .createQueryBuilder()
                .relation(Claim, "purchaseLineItems")
                .of(claimId)
                .remove(lineItemId);

            return { claimId: claimId, purchaseLineItemId: lineItemId };
        } catch (error) {
            console.log(error);
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getClaimInProgressForCompany(companyId: string): Promise<GetClaimInProgressForCompanyResponse> {
        const claim: Claim | null = await this.db.getRepository(Claim).findOne({
            where: {
                companyId,
                status: In(ClaimStatusInProgressTypes),
            },
            order: { createdAt: "DESC" },
            relations: {
                femaDisaster: true,
                selfDisaster: true,
                insurancePolicy: true,
            },
        });
        if (claim) {
            return {
                ...claim,
                status: claim.status as ClaimStatusType,
                createdAt: claim.createdAt.toISOString(),
                updatedAt: claim.updatedAt?.toISOString(),
                femaDisaster: claim.femaDisaster
                    ? {
                          ...claim.femaDisaster,
                          declarationDate: claim.femaDisaster.declarationDate.toISOString(),
                          incidentBeginDate: claim.femaDisaster.incidentBeginDate?.toISOString(),
                          incidentEndDate: claim.femaDisaster.incidentEndDate?.toISOString(),
                      }
                    : undefined,
                selfDisaster: claim.selfDisaster
                    ? {
                          ...claim.selfDisaster,
                          startDate: claim.selfDisaster.startDate.toISOString(),
                          endDate: claim.selfDisaster.endDate?.toISOString(),
                          createdAt: claim.selfDisaster.createdAt.toISOString(),
                          updatedAt: claim.selfDisaster.updatedAt.toISOString(),
                      }
                    : undefined,
                insurancePolicy: claim.insurancePolicy
                    ? {
                          ...claim.insurancePolicy,
                          updatedAt: claim.insurancePolicy.updatedAt.toISOString(),
                          createdAt: claim.insurancePolicy.createdAt.toISOString(),
                      }
                    : undefined,
            };
        }
        return null;
    }
}
