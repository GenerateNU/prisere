import { plainToClass } from "class-transformer";
import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { UserPreferences } from "../../entities/UserPreferences";
import { CreateUserDTO, GetUserCompanyDTO, GetUserDTO, UpdateUserDTO } from "../../types/User";

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
    getCompany(payload: GetUserCompanyDTO): Promise<NonNullCompanyUser | null>;

    /**
     * Updates the user with the given id
     * @param payload The id of the user to be updated and the data to be updated
     * @returns The updated User or null if failed
     */
    updateUser(payload: UpdateUserDTO): Promise<User | null>;
}

type NonNullCompanyUser = Omit<User, "company" | "companyId"> & {
    company: NonNullable<User["company"]>;
    companyId: NonNullable<User["companyId"]>;
};

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

    private hasCompany(user: User): user is NonNullCompanyUser {
        return !!user.companyId && !!user.company;
    }

    async getCompany(payload: GetUserCompanyDTO) {
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

    async updateUser(payload: UpdateUserDTO) {
        const { id: givenId, ...data } = payload;
        console.log({ data });
        const result = await this.db
            .createQueryBuilder()
            .update(User)
            .set(data)
            .where("id = :id", { id: givenId })
            .returning("*")
            .execute();

        return result.raw[0] as User;
    }
}
