import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO } from "../../types/Company";
import { DataSource, InsertResult } from "typeorm";
import Boom from "@hapi/boom";

export interface ICompanyTransaction {
    /**
     * Adds a new Company to the database
     * @param payload Company to be inserted into Database
     * @returns Promise resolving to inserted Company or null if failed
     */
    createCompany(payload: CreateCompanyDTO): Promise<Company | null>;

    /**
     * Gets a Company by it ID
     * @param payload ID of the Company to be fetched
     * @returns Promise resolving to fetched Company or null if not found
     */
    getCompanyById(payload: GetCompanyByIdDTO): Promise<Company | null>;
}

export class CompanyTransaction implements ICompanyTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createCompany(payload: CreateCompanyDTO): Promise<Company | null> {
        if (payload.lastQuickBooksImportTime && typeof payload.lastQuickBooksImportTime === "string") {
            payload.lastQuickBooksImportTime = new Date(payload.lastQuickBooksImportTime);
        }

        const result: InsertResult = await this.db
            .createQueryBuilder()
            .insert()
            .into(Company)
            .values(payload)
            .returning("*")
            .execute();

        const rawCompany = result.raw[0];
        if (!rawCompany) {
            return null;
        }

        // Convert import time to Date type if needed
        if (rawCompany.lastQuickBooksImportTime && typeof rawCompany.lastQuickBooksImportTime === "string") {
            rawCompany.lastQuickBooksImportTime = new Date(rawCompany.lastQuickBooksImportTime);
        }

        return rawCompany;
    }

    async getCompanyById(payload: GetCompanyByIdDTO): Promise<Company | null> {
        if (typeof payload.id !== "string") {
            throw new Error("ID must be of type string");
        }

        try {
            const result: Company | null = await this.db
                .createQueryBuilder()
                .select("company")
                .from(Company, "company")
                .where("company.id = :id", { id: payload.id })
                .getOne();

            // Transform the date field to Date type, if it exists and is a string
            if (result && result.lastQuickBooksImportTime && typeof result.lastQuickBooksImportTime === "string") {
                result.lastQuickBooksImportTime = new Date(result.lastQuickBooksImportTime);
            }

            return result;
        } catch (error) {
            console.log("Transaction error:", error);

            // Check if the ID is not in UIUD format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(payload.id)) {
                throw Boom.badRequest("Invalid UUID format");
            } else {
                throw Boom.notFound("Company Not Found");
            }
            // other option is to just rethrow error instead of notFound assumption
        }
    }
}
