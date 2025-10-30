import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { DataSource, In } from "typeorm";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { LocationAddress } from "../../entities/LocationAddress";
import { User } from "../../entities/User";

export interface ICompanyTransaction {
    /**
     * Adds a new Company to the database
     * @param payload Company to be inserted into Database
     * @returns Promise resolving to inserted Company or null if failed
     */
    createCompany(payload: CreateCompanyDTO, userId: string): Promise<Company | null>;

    /**
     * Gets a Company by it ID
     * @param payload ID of the Company to be fetched
     * @returns Promise resolving to fetched Company or null if not found
     */
    getCompanyById(payload: GetCompanyByIdDTO): Promise<Company | null>;

    /**
     * Updates a company's last quickbooks import time
     * @param payload ID of company import time to update, Last quickbooks import time, Date
     */
    updateLastQuickBooksImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null>;

    /**
     * Gets a Company's locations by company ID
     * @param payload ID of the Company to whose locations will be fetched
     * @returns Promise resolving to fetched Company locations or null if company was not found
     */
    getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]>;
}

export class CompanyTransaction implements ICompanyTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createCompany(payload: CreateCompanyDTO, userId: string): Promise<Company | null> {
        const result = await this.db.transaction(async (manager) => {
            const company = manager.create(Company, payload);
            await manager.save(company);
            await manager.update(User, userId, {
                companyId: company.id,
            });

            return company;
        });

        if (!result) {
            return null;
        }

        return result;
    }

    async getCompanyById(payload: GetCompanyByIdDTO): Promise<Company | null> {
        if (typeof payload.id !== "string") {
            throw new Error("ID must be of type string");
        }

        try {
            const result: Company | null = await this.db.getRepository(Company).findOneBy({ id: payload.id });

            // Transform the date field to Date type, if it exists and is a string
            if (result && result.lastQuickBooksImportTime && typeof result.lastQuickBooksImportTime === "string") {
                result.lastQuickBooksImportTime = new Date(result.lastQuickBooksImportTime);
            }

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error: ${error}`);

            // Check if the ID is not in UIUD format
            if (!validate(payload.id)) {
                throw Boom.badRequest("Invalid UUID format");
            } else {
                throw Boom.notFound("Company Not Found");
            }
            // other option is to just rethrow error instead of notFound assumption
        }
    }

    async updateLastQuickBooksImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null> {
        const result = await this.db
            .createQueryBuilder()
            .update(Company)
            .set({ lastQuickBooksImportTime: payload.importTime })
            .where("id = :id", { id: payload.companyId })
            .returning("*")
            .execute();

        const updatedCompany = result.raw[0];
        if (!updatedCompany) {
            return null;
        }

        // Ensure the date is a Date object
        if (updatedCompany.lastQuickBooksImportTime && typeof updatedCompany.lastQuickBooksImportTime === "string") {
            updatedCompany.lastQuickBooksImportTime = new Date(updatedCompany.lastQuickBooksImportTime);
        }

        return updatedCompany;
    }

    async getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]> {
        const locations = await this.db.manager.findBy(LocationAddress, {
            companyId: payload.id,
        });
        return locations;
    }
}
