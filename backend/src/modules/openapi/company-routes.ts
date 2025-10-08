import { OpenAPIHono} from "@hono/zod-openapi";
import { CompanyController, ICompanyController } from "../company/controller";
import { CompanyService, ICompanyService } from "../company/service";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";
import { DataSource } from "typeorm";
import {createCompanyRoute, getCompanyByIdRoute, updateCompanyImportTimeRoute, getCompanyLocationsByIdRoute} from "@prisere/types"
export const addOpenApiCompanyRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const companyService: ICompanyService = new CompanyService(companyTransaction);
    const companyController: ICompanyController = new CompanyController(companyService);

    openApi.openapi(createCompanyRoute, (ctx) => companyController.createCompany(ctx));
    openApi.openapi(getCompanyByIdRoute, (ctx) => companyController.getCompanyById(ctx));
    openApi.openapi(updateCompanyImportTimeRoute, (ctx) => companyController.updateQuickbooksImportTime(ctx));
    openApi.openapi(getCompanyLocationsByIdRoute, (ctx) => companyController.getCompanyLocationsById(ctx));
    return openApi;
};