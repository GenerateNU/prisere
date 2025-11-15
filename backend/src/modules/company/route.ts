import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ICompanyTransaction, CompanyTransaction } from "./transaction";
import { ICompanyService, CompanyService } from "./service";
import { ICompanyController, CompanyController } from "./controller";
import { ClaimTransaction, IClaimTransaction } from "../claim/transaction";

export const companyRoutes = (db: DataSource): Hono => {
    const company = new Hono();

    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const companyService: ICompanyService = new CompanyService(companyTransaction, claimTransaction);
    const companyController: ICompanyController = new CompanyController(companyService);

    company.get("/", (ctx) => companyController.getCompanyById(ctx));
    company.post("/", (ctx) => companyController.createCompany(ctx));
    company.patch("/quickbooks-invoice-import-time", (ctx) => companyController.updateQuickbooksInvoiceImportTime(ctx));
    company.patch("/quickbooks-purchase-import-time", (ctx) =>
        companyController.updateQuickbooksPurchaseImportTime(ctx)
    );
    company.get("/location-address", (ctx) => companyController.getCompanyLocationsById(ctx));
    company.get("/claim-in-progress", (ctx) => companyController.getClaimInProgress(ctx));
    company.get("/company-external", (ctx) => companyController.getCompanyExternal(ctx));
    company.get("/has-company-data", (ctx) => companyController.hasCompanyData(ctx));
    company.patch("/", (ctx) => companyController.updateCompanyById(ctx));

    return company;
};
