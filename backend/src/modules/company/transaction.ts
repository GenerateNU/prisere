import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO, GetCompanyExternalDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { LocationAddress } from "../../entities/LocationAddress";
import { User } from "../../entities/User";
import { CompanyExternal } from "../../entities/CompanyExternals";
import { Purchase } from "../../entities/Purchase";
import { Invoice } from "../../entities/Invoice";

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
     * Updates a company's last quickbooks invoice import time
     * @param payload ID of company import time to update, Last quickbooks import time, Date
     */
    updateLastQuickBooksInvoiceImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null>;

    /**
     * Updates a company's last quickbooks purchase import time
     * @param payload ID of company import time to update, Last quickbooks import time, Date
     */
    updateLastQuickBooksPurchaseImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null>;

    /**
     * Gets a Company's locations by company ID
     * @param payload ID of the Company to whose locations will be fetched
     * @returns Promise resolving to fetched Company locations or null if company was not found
     */
    getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]>;

    getCompanyExternal(paylaod: GetCompanyExternalDTO): Promise<CompanyExternal | null>;

    getCompanyFinancialData(payload: GetCompanyByIdDTO): Promise<{ purchases: Purchase[]; invoices: Invoice[] } | null>;
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

    async updateLastQuickBooksInvoiceImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null> {
        const result = await this.db
            .createQueryBuilder()
            .update(Company)
            .set({ lastQuickBooksInvoiceImportTime: payload.importTime })
            .where("id = :id", { id: payload.companyId })
            .returning("*")
            .execute();

        console.log(result)

        return result.raw[0] as Company | null;
    }

    async updateLastQuickBooksPurchaseImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company | null> {
        const result = await this.db
            .createQueryBuilder()
            .update(Company)
            .set({ lastQuickBooksPurchaseImportTime: payload.importTime })
            .where("id = :id", { id: payload.companyId })
            .returning("*")
            .execute();

        return result.raw[0] as Company | null;
    }

    async getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]> {
        const locations = await this.db.manager.findBy(LocationAddress, {
            companyId: payload.id,
        });
        return locations;
    }

    async getCompanyExternal(payload: GetCompanyExternalDTO): Promise<CompanyExternal | null> {
        const external = await this.db.getRepository(CompanyExternal).findOneBy({ companyId: payload.id });
        return external ?? null;
    }

    async getCompanyFinancialData(payload: GetCompanyByIdDTO): Promise<{ purchases: Purchase[]; invoices: Invoice[] } | null> {
        const purchases = await this.db.getRepository(Purchase).findBy({ companyId: payload.id });
        const invoices = await this.db.getRepository(Invoice).findBy({ companyId: payload.id });

        console.log(`Purchases: ${purchases.length}`)
        console.log(`Invoices: ${invoices.length}`)

        // If both are empty, return null
        if ((!purchases || purchases.length === 0) && (!invoices || invoices.length === 0)) {
            return null;
        }

        return { purchases, invoices };
    }
}
