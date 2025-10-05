import { Company } from "../../entities/Company";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
export class CompanyTransaction {
    db;
    constructor(db) {
        this.db = db;
    }
    async createCompany(payload) {
        const result = await this.db.getRepository(Company).save(payload);
        if (!result) {
            return null;
        }
        return result;
    }
    async getCompanyById(payload) {
        if (typeof payload.id !== "string") {
            throw new Error("ID must be of type string");
        }
        try {
            const result = await this.db.getRepository(Company).findOneBy({ id: payload.id });
            // Transform the date field to Date type, if it exists and is a string
            if (result && result.lastQuickBooksImportTime && typeof result.lastQuickBooksImportTime === "string") {
                result.lastQuickBooksImportTime = new Date(result.lastQuickBooksImportTime);
            }
            return result;
        }
        catch (error) {
            logMessageToFile(`Transaction error: ${error}`);
            // Check if the ID is not in UIUD format
            if (!validate(payload.id)) {
                throw Boom.badRequest("Invalid UUID format");
            }
            else {
                throw Boom.notFound("Company Not Found");
            }
            // other option is to just rethrow error instead of notFound assumption
        }
    }
    async updateLastQuickBooksImportTime(payload) {
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
}
