import { Context, TypedResponse } from "hono";
import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { GetCompanyByIdAPIResponse, CreateCompanyAPIResponse, CreateCompanyDTOSchema, UpdateQuickBooksImportTimeDTOSchema } from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";

export interface ICompanyController {
    getCompanyById(_ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse> | Response>;
    createCompany(_ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse> | Response>;
    updateQuickbooksImportTime(ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse> | Response>
}

export class CompanyController implements ICompanyController {
    private companyService: ICompanyService;

    constructor(service: ICompanyService) {
        this.companyService = service;
    }

    getCompanyById = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse>> => {
            const id = ctx.req.param("id");
            const companyIdResponse = await this.companyService.getCompanyById({ id: id });
            return ctx.json(companyIdResponse, 200);
        }
    );

    createCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse>> => {
            const json = await ctx.req.json();
            const payload = CreateCompanyDTOSchema.parse(json);
            const company = await this.companyService.createCompany(payload);
            return ctx.json(company, 201);
        }
    );

    updateQuickbooksImportTime = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse>> => {
        const companyId = ctx.req.param("id")
        const body = await ctx.req.json()

        const parseResult = UpdateQuickBooksImportTimeDTOSchema.safeParse({
            companyId,
            importTime: body.importTime ? new Date(body.importTime) : undefined,
        });

        if (!parseResult.success) {
            logMessageToFile("Erroring parsing request body: ", body)
            throw new Error("Missing required data from request body")
        }

        const updated = await this.companyService.updateLastQuickBooksImportTime(parseResult.data);
        if (!updated) {
            logMessageToFile("Company not found")
        }

        return ctx.json({
            ...updated,
            ...(updated.lastQuickBooksImportTime
                ? { lastQuickBooksImportTime: new Date(updated.lastQuickBooksImportTime).toISOString() }
                : {}
            ),
        });
        }
    )
}
