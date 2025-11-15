import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { ILocationAddressTransaction } from "./transaction";
import { DeleteResult } from "typeorm";
import {
    CreateLocationAddressBulkDTO,
    CreateLocationAddressBulkResponse,
    CreateLocationAddressDTO,
    CreateLocationAddressResponse,
    GetLocationAddressDTO,
    GetLocationAddressResponse,
    LocationAddress,
    UpdateLocationAddressBulkDTO,
    UpdateLocationAddressBulkResponse,
    UpdateLocationAddressDTO,
    UpdateLocationAddressResponse,
} from "../../types/Location";
import { IFEMALocationMatcher } from "../clients/fips-location-matching/service";

export interface ILocationAddressService {
    /**
     * Attempts to create a new location address with the given payload
     * @throws If the given payload cannot be used to create a location address
     * @param payload The payload used to try to create a new location address
     */
    createLocationAddress(payload: CreateLocationAddressDTO, companyId: string): Promise<CreateLocationAddressResponse>;

    createLocationAddressBulk(
        payload: CreateLocationAddressBulkDTO,
        companyId: string
    ): Promise<CreateLocationAddressBulkResponse>;

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

    /**
     * Attempts to update a location address based on the given id
     * @param payload The updated location address
     */
    updateLocationAddressById(
        payload: UpdateLocationAddressDTO,
        companyId: string
    ): Promise<UpdateLocationAddressResponse>;

    /**
     * Attempts to update multiple location addresses in bulk
     * @param payload The updated location addresses
     */
    updateLocationAddressBulk(
        payload: UpdateLocationAddressBulkDTO,
        companyId: string
    ): Promise<UpdateLocationAddressBulkResponse>;
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
        async (payload: CreateLocationAddressDTO, companyId: string): Promise<CreateLocationAddressResponse> => {
            const fipsLocation = await this.locationMatcher.getLocationFips(payload);

            if (fipsLocation === null) {
                throw Boom.badRequest("Fips state and county code cannot be null");
            }

            // Add FIPS codes into payload to send to transaction layer
            const completePayload = {
                ...payload,
                fipsStateCode: Number(fipsLocation.fipsStateCode),
                fipsCountyCode: Number(fipsLocation.fipsCountyCode),
            };
            // Pass complete data with fips codes to transaction layer
            const locationAddress = await this.locationAddressTransaction.createLocationAddress(
                completePayload,
                companyId
            );

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

    createLocationAddressBulk = withServiceErrorHandling(
        async (
            payload: CreateLocationAddressBulkDTO,
            companyId: string
        ): Promise<CreateLocationAddressBulkResponse> => {
            const transformedPayload = await Promise.all(
                payload.map(async (element) => {
                    const currFips = await this.locationMatcher.getLocationFips(element);
                    return { ...element, ...currFips };
                })
            );

            const result = await this.locationAddressTransaction.createLocationAddressBulk(
                transformedPayload,
                companyId
            );

            if (result.length !== payload.length) {
                throw Boom.internal(
                    "The number of created addresses does not match the number of given new addresses."
                );
            }

            return result;
        }
    );

    updateLocationAddressById = withServiceErrorHandling(
        async (payload: UpdateLocationAddressDTO, companyId: string): Promise<UpdateLocationAddressResponse> => {
            // get the current location
            const locationAddress = await this.locationAddressTransaction.getLocationAddressById({ id: payload.id });

            if (!locationAddress) {
                throw Boom.badRequest("No location address with given id found");
            }

            const locationForMatching: Partial<LocationAddress> = {
                country: payload.country ?? locationAddress.country,
                stateProvince: payload.stateProvince ?? locationAddress.stateProvince,
                city: payload.city ?? locationAddress.city,
                streetAddress: payload.streetAddress ?? locationAddress.streetAddress,
                postalCode: payload.postalCode ?? locationAddress.postalCode,
                county: payload.county ?? locationAddress.county,
            };

            // get the new fips codes if any of the address fields have changed
            const fipsLocation = await this.locationMatcher.getLocationFips(locationForMatching);

            if (fipsLocation === null) {
                throw Boom.badRequest("Fips state and county code cannot be null");
            }

            const updatedLocationWithFips = {
                ...payload,
                fipsStateCode: Number(fipsLocation.fipsStateCode),
                fipsCountyCode: Number(fipsLocation.fipsCountyCode),
            };

            const updatedLocationAddress = await this.locationAddressTransaction.updateLocationAddressById(
                updatedLocationWithFips,
                companyId
            );

            if (!updatedLocationAddress) {
                throw Boom.internal("Could not update Location");
            }

            return updatedLocationAddress;
        }
    );

    updateLocationAddressBulk = withServiceErrorHandling(
        async (
            payload: UpdateLocationAddressBulkDTO,
            companyId: string
        ): Promise<UpdateLocationAddressBulkResponse> => {
            const updatedLocations = await this.locationAddressTransaction.updateLocationAddressBulk(
                payload,
                companyId
            );
            return updatedLocations;
        }
    );
}
