import { ClaimLocation } from "../../entities/ClaimLocation";
import { LocationAddress } from "../../entities/LocationAddress";
import {
    CreateClaimLocationDTO,
    DeleteClaimLocationDTO,
    DeleteClaimLocationResponse,
    GetLocationsByCompanyIdDTO,
} from "../../types/ClaimLocation";
import { withServiceErrorHandling } from "../../utilities/error";
import { IClaimLocationTransaction } from "./transaction";

export interface IClaimLocationService {
    createClaimLocation(payload: CreateClaimLocationDTO): Promise<ClaimLocation>;
    getLocationsByCompanyId(payload: GetLocationsByCompanyIdDTO): Promise<LocationAddress[]>;
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
            throw new Error("Failed to create Link between Claim and Location");
        }

        return claimLocation;
    });

    getLocationsByCompanyId = withServiceErrorHandling(
        async (payload: GetLocationsByCompanyIdDTO): Promise<LocationAddress[]> => {
            const locations: LocationAddress[] | null = await this.claimLocationTransaction.getLocationsByCompanyId({
                ...payload,
            });
            if (!locations) {
                throw new Error("Failed to fetch Locations for Company");
            }
            return locations;
        }
    );

    deleteClaimLocationsById = withServiceErrorHandling(
        async (payload: DeleteClaimLocationDTO): Promise<DeleteClaimLocationResponse> => {
            const deletedClaimLocation: DeleteClaimLocationResponse | null =
                await this.claimLocationTransaction.deleteClaimLocationById({ ...payload });

            if (!deletedClaimLocation) {
                throw new Error("Failed to delete Link between Claim and Location");
            }
            return deletedClaimLocation;
        }
    );
}
