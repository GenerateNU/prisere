import { withControllerErrorHandling } from "../../utilities/error";
import { CreateCompanyDTOSchema, UpdateQuickBooksImportTimeDTOSchema, } from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
export class CompanyController {
    companyService;
    constructor(service) {
        this.companyService = service;
    }
    getCompanyById = withControllerErrorHandling(async (ctx) => {
        const id = ctx.req.param("id");
        if (!validate(id)) {
            return ctx.json({ error: "Invalid company ID format" }, 400);
        }
        const companyIdResponse = await this.companyService.getCompanyById({ id: id });
        return ctx.json(companyIdResponse, 200);
    });
    createCompany = withControllerErrorHandling(async (ctx) => {
        const json = await ctx.req.json();
        const payload = CreateCompanyDTOSchema.parse(json);
        const company = await this.companyService.createCompany(payload);
        return ctx.json(company, 201);
    });
    updateQuickbooksImportTime = withControllerErrorHandling(async (ctx) => {
        const companyId = ctx.req.param("id");
        const body = await ctx.req.json();
        const parseResult = UpdateQuickBooksImportTimeDTOSchema.safeParse({
            companyId,
            importTime: body.importTime ? new Date(body.importTime) : undefined,
        });
        if (!parseResult.success) {
            return ctx.json({ error: "Invalid request body: ", body }, 400);
        }
        const updated = await this.companyService.updateLastQuickBooksImportTime(parseResult.data);
        if (!updated) {
            logMessageToFile("Company not found");
        }
        return ctx.json({
            ...updated,
            ...(updated.lastQuickBooksImportTime
                ? { lastQuickBooksImportTime: new Date(updated.lastQuickBooksImportTime).toISOString() }
                : {}),
        }, 200);
    });
}
