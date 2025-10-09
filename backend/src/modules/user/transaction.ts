import { User } from "../../entities/User";
import { DataSource } from "typeorm";
import { plainToClass } from "class-transformer";
import { GetUserDTO, CreateUserDTO, GetUserCompanyDTO, GetUserCompanyResponse } from "../../types/User";
import { UserPreferences } from "../../entities/UserPreferences";

export interface IUserTransaction {
    /**
     * Adds a new user to the database
     * @param payload User to be inserted into Database
     * @returns Promise resolving to inserted User or null if failed
     */
    createUser(payload: CreateUserDTO): Promise<User>;

    /**
     * Fetches the user with the given id
     * @param payload The id of the user to be fetched
     * @returns The found User of the given id or null if it DNE
     */
    getUser(payload: GetUserDTO): Promise<User | null>;

    /**
     * Fetches the comapny associated with the given User id
     * @param payload The id of the user whose company data will be returned
     * @returns The found comapny ID and name
     */
    getCompany(payload: GetUserCompanyDTO): Promise<GetUserCompanyResponse | null>;
}

export class UserTransaction implements IUserTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createUser(payload: CreateUserDTO) {
        const user = plainToClass(User, payload);
        const result = await this.db.manager.save(User, user);
        await this.db.getRepository(UserPreferences).insert({
            userId: result.id,
        });
        return result;
    }

    async getUser(payload: GetUserDTO): Promise<User | null> {
        const { id: givenId } = payload;
        const result: User | null = await this.db.manager.findOne(User, { where: { id: givenId } });
        return result;
    }

    async getCompany(payload: GetUserCompanyDTO): Promise<GetUserCompanyResponse | null> {
        const { id: givenId } = payload;
        const result = await this.db.manager.findOne(User, {
            select: { company: true },
            where: { id: givenId },
            relations: { company: true },
        });
        //Check to make sure that the User entity and its associated company were found
        return result && result.company ? { companyId: result.company.id, companyName: result.company.name } : null;
    }
}
