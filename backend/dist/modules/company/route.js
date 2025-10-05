import { Hono } from "hono";
import { CompanyTransaction } from "./transaction";
import { CompanyService } from "./service";
import { CompanyController } from "./controller";
export const companyRoutes = (db) => {
    const company = new Hono();
    const companyTransaction = new CompanyTransaction(db);
    const companyService = new CompanyService(companyTransaction);
    const companyController = new CompanyController(companyService);
    company.get("/:id", (ctx) => companyController.getCompanyById(ctx));
    company.post("/", (ctx) => companyController.createCompany(ctx));
    company.patch("/:id/quickbooks-import-time", (ctx) => companyController.updateQuickbooksImportTime(ctx));
    return company;
};
