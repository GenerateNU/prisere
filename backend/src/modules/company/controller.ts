import { Context, TypedResponse } from "hono";
import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import {
    CreateCompanyDTOSchema,
    UpdateQuickBooksImportTimeDTOSchema,
    GetCompanyByIdResponse,
    CreateCompanyResponse,
} from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { ControllerResponse } from "../../utilities/response";

export interface ICompanyController {
    getCompanyById(_ctx: Context): ControllerResponse<TypedResponse<GetCompanyByIdResponse, 200>>;
    createCompany(_ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 201>>;
    updateQuickbooksImportTime(ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>>;
}

export class CompanyController implements ICompanyController {
    private companyService: ICompanyService;

    constructor(service: ICompanyService) {
        this.companyService = service;
    }

    getCompanyById = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyByIdResponse, 200>> => {
            const id = ctx.req.param("id");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const companyIdResponse = await this.companyService.getCompanyById({ id: id });
            return ctx.json(companyIdResponse, 200);
        }
    );

    createCompany = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateCompanyDTOSchema.parse(json);
            const company = await this.companyService.createCompany(payload);
            return ctx.json(company, 201);
        }
    );

    updateQuickbooksImportTime = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>> => {
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

            return ctx.json(
                {
                    ...updated,
                    ...(updated.lastQuickBooksImportTime
                        ? { lastQuickBooksImportTime: new Date(updated.lastQuickBooksImportTime).toISOString() }
                        : {}),
                },
                200
            );
        }
    );
}
