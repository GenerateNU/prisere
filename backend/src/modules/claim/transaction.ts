import Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { Between, DataSource, FindOptionsWhere, In, LessThan, Like, MoreThan } from "typeorm";
import { Claim } from "../../entities/Claim";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import {
    CreateClaimDTO,
    CreateClaimResponse,
    DeleteClaimDTO,
    DeleteClaimResponse,
    DeletePurchaseLineItemResponse,
    GetClaimByIdResponse,
    GetClaimInProgressForCompanyResponse,
    GetClaimsByCompanyIdResponse,
    GetPurchaseLineItemsForClaimResponse,
    LinkClaimToLineItemDTO,
    LinkClaimToLineItemResponse,
    LinkClaimToPurchaseDTO,
    LinkClaimToPurchaseResponse,
    UpdateClaimStatusDTO,
    UpdateClaimStatusResponse,
} from "../../types/Claim";
import { ClaimStatusInProgressTypes, ClaimStatusType } from "../../types/ClaimStatusType";
import { logMessageToFile } from "../../utilities/logger";
import { InvoiceTransaction } from "../invoice/transaction";
import { IPurchaseLineItemTransaction, PurchaseLineItemTransaction } from "../purchase-line-item/transaction";
import { PurchaseTransaction } from "../purchase/transaction";
import { UserTransaction } from "../user/transaction";
import { ClaimDataForPDF, GetClaimsByCompanyInput } from "./types";

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
    getClaimsByCompanyId(
        companyId: string,
        input: GetClaimsByCompanyInput
    ): Promise<GetClaimsByCompanyIdResponse | null>;

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

    /**
     * To retrieve and package the relevant information to generate a pdf for a claim.
     * @param claimId from the desired claim.
     * @param userId for the user who is making the claim
     * @returns the necessary claim, user, and invoice data to make the pdf
     */
    retrieveDataForPDF(claimId: string, userId: string): Promise<ClaimDataForPDF>;

    /**
     * Gets a single claim by ID with all relations
     * @param claimId ID of the claim to fetch
     * @param companyId ID of the company (for authorization)
     * @returns Promise resolving to the claim with relations or null if not found
     */
    getClaimById(claimId: string, companyId: string): Promise<GetClaimByIdResponse | null>;

    /**
     * Updates a claim's status and related fields
     * @param claimId ID of the claim to update
     * @param payload Update data including status
     * @param companyId ID of the company (for authorization)
     * @returns Promise resolving to the updated claim or null if not found
     */
    updateClaimStatus(
        claimId: string,
        payload: UpdateClaimStatusDTO,
        companyId: string
    ): Promise<UpdateClaimStatusResponse | null>;
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
                claimLocations: result.claimLocations
                    ?.map((cl) => cl.locationAddress)
                    .filter((loc) => loc !== null && loc !== undefined),
            };
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getClaimsByCompanyId(
        companyId: string,
        { filters, page, resultsPerPage }: GetClaimsByCompanyInput
    ): Promise<GetClaimsByCompanyIdResponse | null> {
        try {
            const options: FindOptionsWhere<Claim> = { companyId };

            if (filters.date) {
                if (filters.date.from && filters.date.to) {
                    options.createdAt = Between(new Date(filters.date.from), new Date(filters.date.to));
                } else if (filters.date.from) {
                    options.createdAt = MoreThan(new Date(filters.date.from));
                } else if (filters.date.to) {
                    options.createdAt = LessThan(new Date(filters.date.to));
                }
            }

            if (filters.search) {
                options.name = Like(`%${filters.search}%`);
            }

            const [result, count] = await this.db.getRepository(Claim).findAndCount({
                where: options,
                skip: page * resultsPerPage,
                take: resultsPerPage,
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
                    insurancePolicy: true,
                    claimLocations: {
                        locationAddress: true,
                    },
                    purchaseLineItems: true,
                },
            });

            const data = result.map((claim) => ({
                id: claim.id,
                name: claim.name,
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
                claimLocations: claim.claimLocations
                    ?.map((cl) => cl.locationAddress)
                    .filter((loc) => loc !== null && loc !== undefined),
                purchaseLineItemIds: claim.purchaseLineItems?.map((item) => item.id) ?? [],
            }));

            return {
                data,
                totalCount: count,
                hasMore: (page + 1) * resultsPerPage < count,
                hasPrevious: page > 0,
            };
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
            const existingLink = await this.db.manager
                .createQueryBuilder()
                .from("claim_purchase_line_items", "bridge")
                .where("bridge.claimId = :claimId", { claimId: payload.claimId })
                .andWhere("bridge.purchaseLineItemId = :purchaseLineItemId", {
                    purchaseLineItemId: payload.purchaseLineItemId,
                })
                .getRawOne();

            if (existingLink) {
                return payload;
            }

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
        const lineItems = await purchaseLineItemTransaction.getPurchaseLineItemsForPurchase(payload.purchaseId);

        const lineItemIds = lineItems.map((item) => item.id);

        try {
            await this.db.manager
                .createQueryBuilder()
                .relation(Claim, "purchaseLineItems")
                .of(payload.claimId)
                .add(lineItemIds);
        } catch {
            return null;
        }

        const result = lineItemIds.map((id) => ({
            claimId: payload.claimId,
            purchaseLineItemId: id,
        }));

        return result;
    }

    async getLinkedPurchaseLineItems(claimId: string): Promise<GetPurchaseLineItemsForClaimResponse | null> {
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
                claimLocations: {
                    locationAddress: true,
                },
                purchaseLineItems: true,
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
                claimLocations: claim.claimLocations
                    ?.map((cl) => cl.locationAddress)
                    .filter((loc) => loc !== null && loc !== undefined),
                purchaseLineItemIds: claim.purchaseLineItems?.map((item) => item.id) ?? [],
            };
        }
        return null;
    }

    async retrieveDataForPDF(claimId: string, userId: string): Promise<ClaimDataForPDF> {
        const claimInfo = await this.db.manager.findOne(Claim, {
            where: { id: claimId },
            relations: {
                company: true,
                femaDisaster: true,
                selfDisaster: true,
                claimLocations: {
                    locationAddress: true,
                },
                purchaseLineItems: true,
                insurancePolicy: true,
            },
        });

        const userTransaction = new UserTransaction(this.db);
        const invoiceTransaction = new InvoiceTransaction(this.db);
        const purchaseTransaction = new PurchaseTransaction(this.db);
        const user = await userTransaction.getUser({ id: userId });

        if (!claimInfo) {
            throw Boom.notFound("Could not find the claim");
        }

        if (!user) {
            throw Boom.notFound("Could not find the associated user");
        }

        const revenues = [];
        const purchases = [];

        for (let i = 0; i < 3; i++) {
            const year = new Date().getFullYear() - 1 - i;

            const revenue = await invoiceTransaction.sumInvoicesByCompanyAndDateRange({
                companyId: claimInfo.companyId,
                startDate: new Date(year, 0, 1).toISOString(),
                endDate: new Date(year, 11, 31).toISOString(),
            });

            revenues.push({ year: year, amountCents: revenue });

            const purchaseAmount = await purchaseTransaction.sumPurchasesByCompanyAndDateRange({
                companyId: claimInfo.companyId,
                startDate: new Date(year, 0, 1).toISOString(),
                endDate: new Date(year, 11, 31).toISOString(),
            });

            purchases.push({ year: year, amountCents: purchaseAmount });
        }

        const incomeLastThreeYears = await invoiceTransaction.sumInvoicesByCompanyAndDateRange({
            companyId: claimInfo.companyId,
            startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 4)).toISOString(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
        });

        return {
            ...claimInfo,
            user: user,
            averageIncome: incomeLastThreeYears / 3,
            pastRevenues: revenues,
            pastPurchases: purchases,
            insuranceInfo: claimInfo.insurancePolicy || undefined,
        };
    }

    async getClaimById(claimId: string, companyId: string): Promise<GetClaimByIdResponse | null> {
        try {
            const claim = await this.db.getRepository(Claim).findOne({
                where: { id: claimId, companyId: companyId },
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
                    insurancePolicy: true,
                    claimLocations: {
                        locationAddress: true,
                    },
                    purchaseLineItems: true,
                },
            });

            if (!claim) {
                return null;
            }

            return {
                id: claim.id,
                name: claim.name,
                status: claim.status,
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
                claimLocations: claim.claimLocations
                    ?.map((cl) => cl.locationAddress)
                    .filter((loc) => loc !== null && loc !== undefined),
                purchaseLineItemIds: claim.purchaseLineItems?.map((item) => item.id) ?? [],
            };
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async updateClaimStatus(
        claimId: string,
        payload: UpdateClaimStatusDTO,
        companyId: string
    ): Promise<UpdateClaimStatusResponse | null> {
        try {
            const claim = await this.db.getRepository(Claim).findOne({
                where: { id: claimId, companyId: companyId },
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
                    insurancePolicy: true,
                    purchaseLineItems: true,
                },
            });

            if (!claim) {
                return null;
            }

            // Update the status
            claim.status = payload.status;

            // Update insurance policy if provided
            if (payload.insurancePolicyId !== undefined) {
                claim.insurancePolicyId = payload.insurancePolicyId;
            }

            const updatedClaim = await this.db.manager.save(Claim, claim);

            // Reload to get updated relations
            const result = await this.db.getRepository(Claim).findOne({
                where: { id: updatedClaim.id },
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
                    insurancePolicy: true,
                    claimLocations: {
                        locationAddress: true,
                    },
                },
            });

            if (!result) {
                return null;
            }

            return {
                id: result.id,
                name: result.name,
                status: result.status,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt?.toISOString(),
                femaDisaster: result.femaDisaster
                    ? {
                          ...result.femaDisaster,
                          declarationDate: result.femaDisaster.declarationDate.toISOString(),
                          incidentBeginDate: result.femaDisaster.incidentBeginDate?.toISOString(),
                          incidentEndDate: result.femaDisaster.incidentEndDate?.toISOString(),
                      }
                    : undefined,
                selfDisaster: result.selfDisaster
                    ? {
                          ...result.selfDisaster,
                          startDate: result.selfDisaster.startDate.toISOString(),
                          endDate: result.selfDisaster.endDate?.toISOString(),
                          createdAt: result.selfDisaster.createdAt.toISOString(),
                          updatedAt: result.selfDisaster.updatedAt.toISOString(),
                      }
                    : undefined,
                insurancePolicy: result.insurancePolicy
                    ? {
                          ...result.insurancePolicy,
                          updatedAt: result.insurancePolicy.updatedAt.toISOString(),
                          createdAt: result.insurancePolicy.createdAt.toISOString(),
                      }
                    : undefined,
                claimLocations: result.claimLocations
                    ?.map((cl) => cl.locationAddress)
                    .filter((loc) => loc !== null && loc !== undefined),
                purchaseLineItemIds: result.purchaseLineItems?.map((item) => item.id) ?? [],
            };
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
}
