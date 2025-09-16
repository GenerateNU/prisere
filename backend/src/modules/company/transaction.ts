import { Company } from "../../entities/Company";
import { CreateCompanyDTO, GetCompanyByIdDTO } from "../../types/Company";
import { DataSource, InsertResult,  } from "typeorm";
import { plainToClass } from 'class-transformer';


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

    async createCompany(payload: CreateCompanyDTO): Promise<Company | null>{
        if (payload.lastQuickBooksImportTime && typeof payload.lastQuickBooksImportTime === "string") {
            payload.lastQuickBooksImportTime = new Date(payload.lastQuickBooksImportTime);
        }
        // const company:Company = plainToClass(Company, payload);
        const result:InsertResult = await this.db.createQueryBuilder()
            .insert()
            .into(Company)
            .values(payload)
            .returning("*")
            .execute();
        return result.raw[0] ?? null;
    }

    async getCompanyById(payload: GetCompanyByIdDTO): Promise<Company | null> {
        if (typeof payload.id !== "string") {
            throw new Error("ID must be of type string")
        }
      const company:Company = plainToClass(Company, payload);
      
      const result:Company | null = await this.db.createQueryBuilder()
        .select("company")
        .from(Company, "company")
        .where("company.id = :id", { id: company.id })
        .getOne();
      return result;
    }

}