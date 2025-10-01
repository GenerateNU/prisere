import { CreateCompanyDTO, GetCompanyByIdDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { Company } from "../../entities/Company";
import { ICompanyTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { LocationAddress } from "../../entities/LocationAddress";

export interface ICompanyService {
    createCompany(payload: CreateCompanyDTO): Promise<Company>;
    getCompanyById(payload: GetCompanyByIdDTO): Promise<Company>;
    updateLastQuickBooksImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company>;
    getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]>
}

export class CompanyService implements CompanyService {
    private companyTransaction: ICompanyTransaction;

    constructor(CompanyTransaction: ICompanyTransaction) {
        this.companyTransaction = CompanyTransaction;
    }

    createCompany = withServiceErrorHandling(async (payload: CreateCompanyDTO): Promise<Company> => {
        const company = await this.companyTransaction.createCompany({
            ...payload,
        });
        if (!company) {
            throw Boom.internal("Creating Company Failed");
        }
        return company;
    });

    getCompanyById = withServiceErrorHandling(async (payload: GetCompanyByIdDTO): Promise<Company> => {
        const company = await this.companyTransaction.getCompanyById({
            ...payload,
        });
        if (!company) {
            throw Boom.notFound("Company Not Found");
        }
        return company;
    });

    updateLastQuickBooksImportTime = withServiceErrorHandling(
        async (payload: UpdateQuickBooksImportTimeDTO): Promise<Company> => {
            const company = await this.companyTransaction.updateLastQuickBooksImportTime({
                ...payload,
            });
            if (!company) {
                throw Boom.notFound("Company Not Found");
            }
            return company;
        }
    );

    getCompanyLocationsById = withServiceErrorHandling(
        async (payload: GetCompanyByIdDTO): Promise<LocationAddress[]> => {
            const locations = await this.companyTransaction.getCompanyLocationsById({
                ...payload,
            });

            return locations;
        }
    );
}
