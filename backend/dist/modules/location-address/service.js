import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
export class LocationAddressService {
    locationAddressTransaction;
    constructor(locationAddressTransaction) {
        this.locationAddressTransaction = locationAddressTransaction;
    }
    /**
     * Attempts to create a new location address with the given payload
     * @throws If the given payload cannot be used to create a location address
     * @param payload The payload used to try to create a new location address
     */
    createLocationAddress = withServiceErrorHandling(async (payload) => {
        const locationAddress = await this.locationAddressTransaction.createLocationAddress(payload);
        if (!locationAddress) {
            throw Boom.internal(`Failed to create a location address from the given payload: ${payload}`);
        }
        return locationAddress;
    });
    /**
     * Attempts to find a location address with the given payload
     * @throws If the given payload does not map to a location address
     * @param payload The payload used to try find the location address
     */
    getLocationAddress = withServiceErrorHandling(async (payload) => {
        const locationAddress = await this.locationAddressTransaction.getLocationAddressById(payload);
        if (!locationAddress) {
            throw Boom.notFound(`Failed to fetch a location address from the given payload: ${payload}`);
        }
        return locationAddress;
    });
}
