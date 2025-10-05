import { DataSource } from "typeorm";
import { Claim } from "../../entities/Claim";
import {
    CreateClaimDTO,
    DeleteClaimDTO,
    GetClaimsByCompanyIdDTO as GetClaimsByCompanyIdDTO,
    DeleteClaimResponse,
    GetClaimsByCompanyIdResponse,
} from "../../types/Claim";
import { logMessageToFile } from "../../utilities/logger";
import { plainToClass } from "class-transformer";

export interface IClaimTransaction {
    /**
     * Creates a new claim in the database
     * @param payload Claim to be inserted into the database
     * @returns A promise that resolves to the created claim or null
     */
    createClaim(payload: CreateClaimDTO): Promise<Claim | null>;

    /**
     * Gets a claim by its id
     * @param payload ID of the claim to be fetched
     * @returns Promise resolving to fetched claim or null if not found
     */
    getClaimsByCompanyId(payload: GetClaimsByCompanyIdDTO): Promise<GetClaimsByCompanyIdResponse | null>;

    /**
     * Deletes a claim by its id
     * @param payload ID of the claim to be deleted
     * @returns Promise resolving delete operation or null if not present
     */
    deleteClaim(payload: DeleteClaimDTO): Promise<DeleteClaimResponse | null>;
}

export class ClaimTransaction implements IClaimTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createClaim(payload: CreateClaimDTO): Promise<Claim | null> {
        try {
            const claim: Claim = plainToClass(Claim, { ...payload, status: "CREATED", createdAt: new Date() });

            const result: Claim = await this.db.getRepository(Claim).save(claim);

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getClaimsByCompanyId(payload: GetClaimsByCompanyIdDTO): Promise<GetClaimsByCompanyIdResponse | null> {
        try {
            const result: GetClaimsByCompanyIdResponse | null = await this.db
                .getRepository(Claim)
                .find({ where: { companyId: payload.companyId } });

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async deleteClaim(payload: DeleteClaimDTO): Promise<DeleteClaimResponse | null> {
        try {
            const result = await this.db.getRepository(Claim).delete({ id: payload.id });
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
