import { LocationAddress } from "../../entities/LocationAddress";
import { plainToClass } from "class-transformer";
/**
 * All of the supported transactions for a LocationAddress
 */
export class LocationAddressTransactions {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Adds a new location address to the database
     * @param payload The location information to be inserted into the database
     * @returns Promise resolving to inserted LocationAddress or null if failed
     */
    async createLocationAddress(payload) {
        const address = plainToClass(LocationAddress, payload);
        const newAddress = await this.db.getRepository(LocationAddress).save(address);
        return newAddress ?? null;
    }
    /**
     * Finds an existing location address in the database
     * @param payload The
     * @returns Promise resolving the LocationAddress associated with the given ID or null if the value does not exist
     */
    async getLocationAddressById(payload) {
        const { id: givenId } = payload;
        const maybeFoundLocation = await this.db.manager.findOne(LocationAddress, { where: { id: givenId } });
        return maybeFoundLocation;
    }
}
