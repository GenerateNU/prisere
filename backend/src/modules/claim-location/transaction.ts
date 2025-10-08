import { DataSource } from "typeorm";
import { logMessageToFile } from "../../utilities/logger";
import { ClaimLocation } from "../../entities/ClaimLocation";
import { LocationAddress } from "../../entities/LocationAddress";

export interface IClaimLocationTransaction {
    /**
     * Adds a new ClaimLocation to the database
     * @param payload the claim and location to be inserted into Database
     * @returns Promise resolving to inserted ClaimLocation or null if failed
     */
    createClaimLocation(payload: { claimId: string; locationAddressId: string }): Promise<ClaimLocation | null>;

    /**
     * Gets all of the locations impacted by a claim using a company ID
     * @param payload ID of the company whose locations are to be fetched
     * @returns Promise resolving to fetched locations or empty array if none found
     */
    getLocationsByCompanyId(payload: { companyId: string }): Promise<LocationAddress[] | null>;

    /**
     * Deletes a ClaimLocation by its ID
     * @param payload ID of the ClaimLocation to be deleted
     * @returns Promise resolving to id of deleted ClaimLocation or null if not found
     */
    deleteClaimLocationById(payload: { claimId: string; locationId: string }): Promise<{ success: boolean } | null>;
}

export class ClaimLocationTransaction implements IClaimLocationTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createClaimLocation(payload: { claimId: string; locationAddressId: string }): Promise<ClaimLocation | null> {
        try {
            const result: ClaimLocation = await this.db.getRepository(ClaimLocation).save({
                claimId: payload.claimId,
                locationAddressId: payload.locationAddressId,
            });

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getLocationsByCompanyId(payload: { companyId: string }): Promise<LocationAddress[] | null> {
        try {
            return await this.db
                .getRepository(LocationAddress)
                .createQueryBuilder("location")
                .innerJoin("location.claimLocations", "cl")
                .innerJoin("cl.claim", "claim")
                .where("claim.companyId = :companyId", { companyId: payload.companyId })
                .distinct(true)
                .getMany();
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async deleteClaimLocationById(payload: {
        claimId: string;
        locationId: string;
    }): Promise<{ success: boolean } | null> {
        try {
            const result = await this.db.getRepository(ClaimLocation).delete({
                claimId: payload.claimId,
                locationAddressId: payload.locationId,
            });

            // Return null if deleted column doesn't exist
            if (result.affected && result.affected > 0) {
                return { success: true };
            } else {
                return null;
            }
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
}
