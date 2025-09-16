import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ICompanyTransaction, CompanyTransaction } from "./transaction";
import { ICompanyService, CompanyService } from "./service";
import { ICompanyController, CompanyController } from "./controller";

export const companyRoutes = (db: DataSource): Hono => {
  const company = new Hono();

  const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
  const companyService: ICompanyService = new CompanyService(companyTransaction);
  const companyController: ICompanyController = new CompanyController(companyService);

  company.get("/:cid", (ctx) => companyController.getCompanyById(ctx));
  company.post("/", (ctx) => companyController.createCompany(ctx))

  return company;
};