import { CreateCompanyDTO, GetCompanyByIdDTO } from "../../types/Company";
import { Company } from "../../entities/Company";
import { ICompanyTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { CreateUserDTO } from "../../types/User";

export interface ICompanyService {
    createCompany(payload: CreateCompanyDTO): Promise<Company>;
    getCompanyById(payload: GetCompanyByIdDTO): Promise<Company>;
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
    })


    getCompanyById = withServiceErrorHandling(async (payload: GetCompanyByIdDTO): Promise<Company> => {
        const company = await this.companyTransaction.getCompanyById({
          ...payload,
        });
        if (!company) {
          throw Boom.internal("Company Not Found");
        }
        return company;
    })
}