import { CreateCompanyDTO, GetCompanyByIdDTO, GetCompanyExternalResponse, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { Company } from "../../entities/Company";
import { ICompanyTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { LocationAddress } from "../../entities/LocationAddress";
import { IClaimTransaction } from "../claim/transaction";
import { GetClaimInProgressForCompanyResponse } from "../../types/Claim";
import { CompanyExternal } from "../../entities/CompanyExternals";

export interface ICompanyService {
    createCompany(payload: CreateCompanyDTO, userId: string): Promise<Company>;
    getCompanyById(payload: GetCompanyByIdDTO): Promise<Company>;
    updateLastQuickBooksInvoiceImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company>;
    updateLastQuickBooksPurchaseImportTime(payload: UpdateQuickBooksImportTimeDTO): Promise<Company>;
    getCompanyLocationsById(payload: GetCompanyByIdDTO): Promise<LocationAddress[]>;
    getClaimInProgress(companyId: string): Promise<GetClaimInProgressForCompanyResponse>;
    getCompanyExternal(companyId: string): Promise<CompanyExternal | null>;
    hasCompanyData(companyId: string): Promise<boolean>;
}

export class CompanyService implements CompanyService {
    private companyTransaction: ICompanyTransaction;
    private claimTransaction: IClaimTransaction;

    constructor(CompanyTransaction: ICompanyTransaction, ClaimTransaction: IClaimTransaction) {
        this.companyTransaction = CompanyTransaction;
        this.claimTransaction = ClaimTransaction;
    }

    createCompany = withServiceErrorHandling(async (payload: CreateCompanyDTO, userId: string): Promise<Company> => {
        const company = await this.companyTransaction.createCompany(payload, userId);
        if (!company) {
            throw Boom.internal("Creating Company Failed");
        }
        return company;
    });

    getCompanyById = withServiceErrorHandling(async (payload: GetCompanyByIdDTO): Promise<Company> => {
        const company = await this.companyTransaction.getCompanyById(payload);
        if (!company) {
            throw Boom.notFound("Company Not Found");
        }
        return company;
    });

    updateLastQuickBooksInvoiceImportTime = withServiceErrorHandling(
        async (payload: UpdateQuickBooksImportTimeDTO): Promise<Company> => {
            const company = await this.companyTransaction.updateLastQuickBooksInvoiceImportTime(payload);
            if (!company) {
                throw Boom.notFound("Company Not Found");
            }
            return company;
        }
    );

    updateLastQuickBooksPurchaseImportTime = withServiceErrorHandling(
        async (payload: UpdateQuickBooksImportTimeDTO): Promise<Company> => {
            const company = await this.companyTransaction.updateLastQuickBooksPurchaseImportTime(payload);
            if (!company) {
                throw Boom.notFound("Company Not Found");
            }
            return company;
        }
    );

    getCompanyLocationsById = withServiceErrorHandling(
        async (payload: GetCompanyByIdDTO): Promise<LocationAddress[]> => {
            const locations = await this.companyTransaction.getCompanyLocationsById(payload);

            return locations;
        }
    );

    getClaimInProgress = withServiceErrorHandling(
        async (companyId: string): Promise<GetClaimInProgressForCompanyResponse> => {
            const claim = await this.claimTransaction.getClaimInProgressForCompany(companyId);

            return claim;
        }
    );

    getCompanyExternal = withServiceErrorHandling(
        async (companyId: string): Promise<CompanyExternal | null> => {
            const external = await this.companyTransaction.getCompanyExternal({ id: companyId });
            return external;
        }
    );

    hasCompanyData = withServiceErrorHandling(
        async (companyId: string): Promise<boolean> => {
            const external = await this.companyTransaction.getCompanyExternal({ id: companyId });
            if (external) {
                console.log("Company has external company")
                return true;
            }
            const financialData = await this.companyTransaction.getCompanyFinancialData({ id: companyId });
            if (financialData) {
                console.log("Company has financial data")
                return true;
            }
            return false;
    });
}
