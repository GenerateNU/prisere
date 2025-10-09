import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { ILocationAddressTransaction } from "./transaction";
import { logMessageToFile } from "../../utilities/logger";
import { DeleteResult } from "typeorm";
import {
    CreateLocationAddressDTO,
    CreateLocationAddressResponse,
    GetLocationAddressDTO,
    GetLocationAddressResponse,
    LocationAddress,
} from "../../types/Location";
import { IFEMALocationMatcher } from "../fips-location-matching/service";

export interface ILocationAddressService {
    /**
     * Attempts to create a new location address with the given payload
     * @throws If the given payload cannot be used to create a location address
     * @param payload The payload used to try to create a new location address
     */
    createLocationAddress(payload: CreateLocationAddressDTO): Promise<CreateLocationAddressResponse>;

    /**
     * Attempts to find a location address with the given payload
     * @throws If the given payload does not map to a location address
     * @param payload The payload used to try find the location address
     */
    getLocationAddress(payload: GetLocationAddressDTO): Promise<GetLocationAddressResponse>;

    /**
     * Attempts to remove a location address with the given id (in the payload)
     * @throws If the given id does not map to a location address
     * @param payload contains the id for the location that must be removed
     */
    removeLocationAddressById(payload: GetLocationAddressDTO): Promise<DeleteResult>;
}

export class LocationAddressService implements ILocationAddressService {
    private locationAddressTransaction: ILocationAddressTransaction;
    private locationMatcher: IFEMALocationMatcher;

    constructor(locationAddressTransaction: ILocationAddressTransaction, locationMatcher: IFEMALocationMatcher) {
        this.locationAddressTransaction = locationAddressTransaction;
        this.locationMatcher = locationMatcher;
    }

    /**
     * Attempts to create a new location address with the given payload
     * @throws If the given payload cannot be used to create a location address
     * @param payload The payload used to try to create a new location address
     */
    createLocationAddress = withServiceErrorHandling(
        async (payload: CreateLocationAddressDTO): Promise<CreateLocationAddressResponse> => {
            console.log("CREATING")
            const fipsLocation = await this.locationMatcher.getLocationFips(payload);
            console.log("FIPS Location: ", fipsLocation)
            
            // Add FIPS codes into payload to send to transaction layer
            const completePayload = {
                ...payload,
                fipsStateCode: fipsLocation ? Number(fipsLocation.fipsStateCode) : null,
                fipsCountyCode: fipsLocation ? Number(fipsLocation.fipsCountyCode) : null,
            };

            console.log("Complete paylaod: ", completePayload)
            
            // Pass enriched data to transaction layer
            const locationAddress = await this.locationAddressTransaction.createLocationAddress(completePayload);
            
            if (!locationAddress) {
                throw new Error("Failed to create location address");
            }
            
            return locationAddress;
        }
    );

    /**
     * Attempts to find a location address with the given payload
     * @throws If the given payload does not map to a location address
     * @param payload The payload used to try find the location address
     */
    getLocationAddress = withServiceErrorHandling(async (payload: GetLocationAddressDTO): Promise<LocationAddress> => {
        const locationAddress = await this.locationAddressTransaction.getLocationAddressById(payload);

        if (!locationAddress) {
            throw Boom.notFound("No Location Address found with the given the ID");
        }

        return locationAddress;
    });

    removeLocationAddressById = withServiceErrorHandling(
        async (payload: GetLocationAddressDTO): Promise<DeleteResult> => {
            const result = await this.locationAddressTransaction.removeLocationAddressById(payload);
            return result;
        }
    );
}
