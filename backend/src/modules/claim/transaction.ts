import { DataSource } from "typeorm";
import { Claim } from "../../entities/Claim";
import {
    CreateClaimDTO,
    DeleteClaimDTO,
    DeleteClaimResponse,
    GetClaimsByCompanyIdResponse,
    CreateClaimResponse,
} from "../../types/Claim";
import { logMessageToFile } from "../../utilities/logger";
import { plainToClass } from "class-transformer";
import { ClaimStatusType } from "../../types/ClaimStatusType";

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
}

export class ClaimTransaction implements IClaimTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createClaim(payload: CreateClaimDTO, companyId: string): Promise<CreateClaimResponse | null> {
        try {
            const claim: Claim = plainToClass(Claim, {
                ...payload,
                status: ClaimStatusType.ACTIVE,
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
            };
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getClaimsByCompanyId(companyId: string): Promise<GetClaimsByCompanyIdResponse | null> {
        try {
            const result: Claim[] = await this.db.getRepository(Claim).find({
                where: { companyId: companyId },
                relations: {
                    femaDisaster: true,
                    selfDisaster: true,
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
}
