import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
export class CompanyService {
    companyTransaction;
    constructor(CompanyTransaction) {
        this.companyTransaction = CompanyTransaction;
    }
    createCompany = withServiceErrorHandling(async (payload) => {
        const company = await this.companyTransaction.createCompany({
            ...payload,
        });
        if (!company) {
            throw Boom.internal("Creating Company Failed");
        }
        return company;
    });
    getCompanyById = withServiceErrorHandling(async (payload) => {
        const company = await this.companyTransaction.getCompanyById({
            ...payload,
        });
        if (!company) {
            throw Boom.notFound("Company Not Found");
        }
        return company;
    });
    updateLastQuickBooksImportTime = withServiceErrorHandling(async (payload) => {
        const company = await this.companyTransaction.updateLastQuickBooksImportTime({
            ...payload,
        });
        if (!company) {
            throw Boom.notFound("Company Not Found");
        }
        return company;
    });
}
