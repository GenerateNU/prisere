import { DataSource } from "typeorm";
import { LocationAddress } from "../../types/Location";
import { logMessageToFile } from "../../utilities/logger";
import { ClaimLocation } from "../../entities/ClaimLocation";
import { Company } from "../../entities/Company";
import { LocationAddress, LocationAddress } from "../../entities/LocationAddress";

export interface IClaimLocationTransaction {
    /**
     * Adds a new ClaimLocation to the database
     * @param payload the claim and location to be inserted into Database
     * @returns Promise resolving to inserted ClaimLocation or null if failed
     */
    createClaimLocation(payload: { claimId: string; locationId: string }): Promise<ClaimLocation | null>;

    /**
     * Gets all of the locations impacted by a claim using a company ID
     * @param payload ID of the company whose locations are to be fetched
     * @returns Promise resolving to fetched locations or empty array if none found
     */
    getLocationsByCompanyId(payload: { companyId: string }): Promise<LocationAddress[]>;

    /**
     * Deletes a ClaimLocation by its ID
     * @param payload ID of the ClaimLocation to be deleted
     * @returns Promise resolving to id of deleted ClaimLocation or null if not found
     */
    deleteClaimLocationById(payload: { claimId: string; locationId: string; }): Promise<{ id: string } | null>;
}

export class ClaimLocationTransaction implements IClaimLocationTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createClaimLocation(payload: { claimId: string; locationId: string; }): Promise<ClaimLocation | null> {
        try {
            const result: ClaimLocation = await this.db.getRepository(ClaimLocation).save({
                claimId: payload.claimId,
                locationAddressId: payload.locationId,
            });

            return result;

        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async getLocationsByCompanyId(payload: { companyId: string; }): Promise<LocationAddress[] | null> {
        try {
            const result: LocationAddress[] = await this.db.getRepository(LocationAddress).find({
                where: {
                    claimLocation: {
                        claim
                    }
                }
            })

            return result;

        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }

    async deleteClaimLocationById(payload: { claimId: string; locationId: string; }): Promise<{ id: string; } | null> {
        try {
            const result = await this.db.getRepository(ClaimLocation).delete({
                claimId: payload.claimId,
                locationAddressId: payload.locationId,
            });

            // Return null if deleted column doesn't exist
            if (result.affected && result.affected > 0) {
                return { id: payload.locationId };
            } else {
                return null;
            }
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            return null;
        }
    }
}