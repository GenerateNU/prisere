import { DataSource, DeleteResult } from "typeorm";
import { LocationAddress } from "../../entities/LocationAddress";
import {
    CreateLocationAddressBulkDTO,
    CreateLocationAddressDTO,
    GetLocationAddressDTO,
    UpdateLocationAddressBulkDTO,
    UpdateLocationAddressBulkResponse,
    UpdateLocationAddressDTO,
    UpdateLocationAddressResponse,
} from "../../types/Location";
import { plainToClass } from "class-transformer";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { User } from "../../entities/User";
import { logMessageToFile } from "../../utilities/logger";
import Boom from "@hapi/boom";

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

    /**
     * Gets all user-disaster pairs based on locations affedted by new disasters, for notification creation
     * @param disasters Array of FEMA disasters to check
     * @returns Promise resolving to array of user-disaster pairs
     */
    getUsersAffectedByDisasters(
        disasters: FemaDisaster[]
    ): Promise<{ user: User; disaster: FemaDisaster; location: LocationAddress }[]>;

    /**
     * Updates a location address by its id
     * @param payload The updated location address
     */
    updateLocationAddressById(
        payload: UpdateLocationAddressDTO,
        companyId: string
    ): Promise<UpdateLocationAddressResponse | null>;

    /**
     * Updates multiple location addresses in bulk by their ids
     * @param payload The updated location addresses
     */
    updateLocationAddressBulk(
        payload: UpdateLocationAddressBulkDTO,
        companyId: string
    ): Promise<UpdateLocationAddressBulkResponse>;
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

    async getUsersAffectedByDisasters(
        disasters: FemaDisaster[]
    ): Promise<{ user: User; disaster: FemaDisaster; location: LocationAddress }[]> {
        const fipsPairs = disasters.map((d) => ({
            fipsStateCode: d.fipsStateCode,
            fipsCountyCode: d.fipsCountyCode,
            disaster: d,
        }));

        if (fipsPairs.length === 0) {
            return [];
        }

        const query = this.db
            .getRepository(LocationAddress)
            .createQueryBuilder("location")
            .innerJoinAndSelect("location.company", "company")
            .innerJoinAndSelect("company.user", "user");

        // Build OR conditions for each FIPS location pair
        const conditions = fipsPairs
            .map(
                (pair, index) =>
                    `(location.fipsStateCode = :state${index} AND location.fipsCountyCode = :county${index})`
            )
            .join(" OR ");

        query.where(`(${conditions})`);

        // Set parameters for type enforcing
        const parameters: any = {};
        fipsPairs.forEach((pair, index) => {
            parameters[`state${index}`] = pair.fipsStateCode;
            parameters[`county${index}`] = pair.fipsCountyCode;
        });

        query.setParameters(parameters);

        const locations = await query.getMany();

        logMessageToFile(`There are ${locations.length} locations that are affected by new FEMA Disasters.`);

        // Map to user-disaster pairs
        const userDisasterPairs: { user: User; disaster: FemaDisaster; location: LocationAddress }[] = [];

        for (const location of locations) {
            // Find which disasters affect this location, there could be multiple
            const affectingDisasters = disasters.filter(
                (disaster) =>
                    disaster.fipsStateCode === location.fipsStateCode &&
                    disaster.fipsCountyCode === location.fipsCountyCode
            );

            // Create user-disaster pairs for each affecting disaster, to easily convert pairs to notifications
            for (const disaster of affectingDisasters) {
                if (location.company?.user) {
                    logMessageToFile(`User ${location.company.user} is affected by disaster ${disaster}.`);
                    userDisasterPairs.push({
                        user: location.company.user,
                        disaster: disaster,
                        location: location,
                    });
                }
            }
        }

        return userDisasterPairs;
    }

    async updateLocationAddressById(
        payload: UpdateLocationAddressDTO,
        companyId: string
    ): Promise<UpdateLocationAddressResponse | null> {
        const updateResponse = await this.db.manager.update(
            LocationAddress,
            { id: payload.id, companyId: companyId },
            payload
        );
        return updateResponse.affected === 1 ? this.db.manager.findOneBy(LocationAddress, { id: payload.id }) : null;
    }

    async updateLocationAddressBulk(
        payload: UpdateLocationAddressBulkDTO,
        companyId: string
    ): Promise<UpdateLocationAddressBulkResponse> {
        const updatedLocations: LocationAddress[] = [];

        await this.db.transaction(async (manager) => {
            for (const policy of payload) {
                const updateResponse = await manager.update(
                    LocationAddress,
                    { id: policy.id, companyId: companyId },
                    policy
                );
                if (updateResponse.affected === 1) {
                    const updatedLocation = await manager.findOneBy(LocationAddress, { id: policy.id });
                    if (updatedLocation) {
                        updatedLocations.push(updatedLocation);
                    }
                } else {
                    // will rollback the transaction if any update fails
                    throw Boom.internal(`Failed to update policy with ID: ${policy.id}`);
                }
            }
        });

        return updatedLocations;
    }
}
