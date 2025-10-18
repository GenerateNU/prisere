import { User } from "../../entities/User";
import { DataSource } from "typeorm";
import { plainToClass } from "class-transformer";
import { GetUserDTO, CreateUserDTO, GetUserCompanyDTO } from "../../types/User";
import { UserPreferences } from "../../entities/UserPreferences";
import { Company } from "../../entities/Company";

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
     * Fetches the company associated with the given User id
     * @param payload The id of the user whose company data will be returned
     * @returns The found company ID and name
     */
    getCompany(payload: GetUserCompanyDTO): Promise<(Omit<User, "company"> & { company: Company }) | null>;
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

    private hasCompany(user: User): user is Omit<User, "company"> & { company: Company } {
        return !!user.company;
    }

    async getCompany(payload: GetUserCompanyDTO): Promise<(Omit<User, "company"> & { company: Company }) | null> {
        const { id: givenId } = payload;
        const result = await this.db.manager.findOne(User, {
            select: { company: true },
            where: { id: givenId },
            relations: { company: true },
        });

        //Check to make sure that the User entity and its associated company were found
        if (result && this.hasCompany(result)) {
            return result;
        }

        return null;
    }
}
