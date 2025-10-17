import Boom from "@hapi/boom";
import { ClaimLocation } from "../../entities/ClaimLocation";
import { LocationAddress } from "../../entities/LocationAddress";
import { CreateClaimLocationDTO, DeleteClaimLocationDTO, DeleteClaimLocationResponse } from "../../types/ClaimLocation";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimLocationTransaction } from "./transaction";

export interface IClaimLocationService {
    createClaimLocation(payload: CreateClaimLocationDTO): Promise<ClaimLocation>;
    getLocationsByCompanyId(companyId: string): Promise<LocationAddress[]>;
    deleteClaimLocationsById(payload: DeleteClaimLocationDTO): Promise<DeleteClaimLocationResponse>;
}

export class ClaimLocationService {
    private claimLocationTransaction: IClaimLocationTransaction;

    constructor(ClaimLocationTransaction: IClaimLocationTransaction) {
        this.claimLocationTransaction = ClaimLocationTransaction;
    }

    createClaimLocation = withServiceErrorHandling(async (payload: CreateClaimLocationDTO): Promise<ClaimLocation> => {
        const claimLocation: ClaimLocation | null = await this.claimLocationTransaction.createClaimLocation({
            ...payload,
        });

        if (!claimLocation) {
            throw Boom.internal("Failed to create Link between Claim and Location");
        }

        return claimLocation;
    });

    getLocationsByCompanyId = withServiceErrorHandling(async (companyId: string): Promise<LocationAddress[]> => {
        const locations: LocationAddress[] | null =
            await this.claimLocationTransaction.getLocationsByCompanyId(companyId);
        if (!locations) {
            throw Boom.notFound("Unable to find the locations for the company with: ", companyId);
        }
        return locations;
    });

    deleteClaimLocationsById = withServiceErrorHandling(
        async (payload: DeleteClaimLocationDTO): Promise<DeleteClaimLocationResponse> => {
            const deletedClaimLocation: DeleteClaimLocationResponse | null =
                await this.claimLocationTransaction.deleteClaimLocationById({ ...payload });

            if (!deletedClaimLocation) {
                throw Boom.internal("Failed to delete Link between Claim and Location: ", payload);
            }
            return deletedClaimLocation;
        }
    );
}
