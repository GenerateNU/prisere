import { DataSource, DeleteResult } from "typeorm";
import { LocationAddress } from "../../entities/LocationAddress";
import { CreateLocationAddressBulkDTO, CreateLocationAddressDTO, GetLocationAddressDTO } from "../../types/Location";
import { plainToClass } from "class-transformer";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { User } from "../../entities/User";
import { logMessageToFile } from "../../utilities/logger";

export interface ILocationAddressTransaction {
    /**
     * Adds a new location address to the database
     * @param payload The location information to be inserted into the database
     * @returns Promise resolving to inserted LocationAddress or null if failed
     */
    createLocationAddress(payload: CreateLocationAddressDTO, companyId: string): Promise<LocationAddress | null>;

    createLocationAddressBulk(payload: CreateLocationAddressBulkDTO, companyId: string): Promise<LocationAddress[]>;

    /**
     * Finds an existing location address in the database
     * @param payload The id of the location that must be fetched
     * @returns Promise resolving the LocationAddress associated with the given ID or null if the value does not exist
     */
    getLocationAddressById(payload: GetLocationAddressDTO): Promise<LocationAddress | null>;

    /**
     * Removes the location address with the given id
     * @param payload the id of the location that must be removed
     * @return the location address that was removed
     */
    removeLocationAddressById(payload: GetLocationAddressDTO): Promise<DeleteResult>;
}

/**
 * All of the supported transactions for a LocationAddress
 */
export class LocationAddressTransactions implements ILocationAddressTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createLocationAddressBulk(
        payload: CreateLocationAddressBulkDTO,
        companyId: string
    ): Promise<LocationAddress[]> {
        try {
            const addresses: LocationAddress[] = payload.map((element) =>
                plainToClass(LocationAddress, {
                    ...element,
                    companyId: companyId,
                })
            );
            const newAddress: LocationAddress[] = await this.db.getRepository(LocationAddress).save(addresses);

            return newAddress;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    /**
     * Adds a new location address to the database
     * @param payload The location information to be inserted into the database
     * @returns Promise resolving to inserted LocationAddress or null if failed
     */
    async createLocationAddress(payload: CreateLocationAddressDTO, companyId: string): Promise<LocationAddress | null> {
        const address: LocationAddress = plainToClass(LocationAddress, {
            ...payload,
            companyId: companyId,
        });
        const newAddress: LocationAddress = await this.db.getRepository(LocationAddress).save(address);

        return newAddress ?? null;
    }

    /**
     * Finds an existing location address in the database
     * @param payload The
     * @returns Promise resolving the LocationAddress associated with the given ID or null if the value does not exist
     */
    async getLocationAddressById(payload: GetLocationAddressDTO): Promise<LocationAddress | null> {
        const { id: givenId } = payload;
        const maybeFoundLocation = await this.db.manager.findOneBy(LocationAddress, { id: givenId });
        return maybeFoundLocation;
    }

    async removeLocationAddressById(payload: GetLocationAddressDTO): Promise<DeleteResult> {
        const id = payload.id;
        const result = await this.db.manager.delete(LocationAddress, { id: id });
        return result;
    }

}
