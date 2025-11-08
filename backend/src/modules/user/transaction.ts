import { User } from "../../entities/User";
import { Company } from "../../entities/Company";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { DataSource } from "typeorm";
import { plainToClass } from "class-transformer";
import { GetUserDTO, CreateUserDTO, GetUserCompanyDTO, GetDisastersAffectingUserDTO } from "../../types/User";
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
     * Fetches the company associated with the given User id
     * @param payload The id of the user whose company data will be returned
     * @returns The found company ID and name
     */
    getCompany(payload: GetUserCompanyDTO): Promise<NonNullCompanyUser | null>;

    /**
     * Fetches pairs of company to disaster for the disaster that affects the user's company (array in case user has multiple companies)
     * If there are multiple disasters affecting a company it will be returned like {company 1, disaster 1}, {company 1, disaster 2}, etc.
     * @param payload The id of the user whose company data will be returned
     * @returns The found company ID and disaster ID pairs
     */
    getDisastersAffectingUser(payload: GetDisastersAffectingUserDTO): Promise<{company: Company, disaster: FemaDisaster}[]>
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

    async getDisastersAffectingUser(payload: GetDisastersAffectingUserDTO): Promise<{ company: Company, disaster: FemaDisaster }[]> {
        const { id: userId } = payload;

        // Fetch user with their company
        const user = await this.db.manager.findOne(User, {
            where: { id: userId },
            relations: { company: true },
        });

        if (!user || !user.company) {
            return [];
        }

        // Fetch all locations for the company
        // Can't fetch locations from company, so must get locations first
        const locations = await this.db.manager.find("LocationAddress", {
            where: { companyId: user.company.id },
        });

        if (!locations.length) {
            return [];
        }

        // Collect all unique FIPS county and state code pairs for the companies locations
        const fipsPairs = locations
            .map((loc: any) => ({
                fipsStateCode: loc.fipsStateCode,
                fipsCountyCode: loc.fipsCountyCode,
            }))
            .filter(pair => pair.fipsStateCode && pair.fipsCountyCode);

        // Remove duplicates
        const uniqueFipsPairs = Array.from(
            new Set(fipsPairs.map(pair => `${pair.fipsStateCode}-${pair.fipsCountyCode}`))
        ).map(key => {
            const [fipsStateCode, fipsCountyCode] = key.split('-').map(Number);
            return { fipsStateCode, fipsCountyCode };
        });

        if (!uniqueFipsPairs.length) {
            return [];
        }

        // Find disasters affecting any of these FIPS pairs
        const disasters = await this.db.manager.find(FemaDisaster, {
            where: uniqueFipsPairs.map(pair => ({
                fipsStateCode: pair.fipsStateCode,
                fipsCountyCode: pair.fipsCountyCode,
            })),
        });

        return disasters.map(disaster => ({
            company: user.company!,
            disaster,
        }));
    }
}
