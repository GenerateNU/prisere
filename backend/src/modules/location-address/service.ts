import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { ILocationAddressTransaction } from "./transaction";
import {
    CreateLocationAddressDTO,
    CreateLocationAddressResponse,
    GetLocationAddressDTO,
    GetLocationAddressResponse,
    LocationAddress,
} from "../../types/Location";

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
}

export class LocationAddressService implements ILocationAddressService {
    private locationAddressTransaction: ILocationAddressTransaction;

    constructor(locationAddressTransaction: ILocationAddressTransaction) {
        this.locationAddressTransaction = locationAddressTransaction;
    }

    /**
     * Attempts to create a new location address with the given payload
     * @throws If the given payload cannot be used to create a location address
     * @param payload The payload used to try to create a new location address
     */
    createLocationAddress = withServiceErrorHandling(
        async (payload: CreateLocationAddressDTO): Promise<LocationAddress> => {
            const locationAddress = await this.locationAddressTransaction.createLocationAddress(payload);

            if (!locationAddress) {
                throw Boom.internal(`Failed to create a location address from the given payload: ${payload}`);
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
            throw Boom.notFound(`Failed to fetch a location address from the given payload: ${payload}`);
        }

        return locationAddress;
    });
}
