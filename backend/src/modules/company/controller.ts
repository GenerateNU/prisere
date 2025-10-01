import { Context, TypedResponse } from "hono";
import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import {
    GetCompanyByIdAPIResponse,
    CreateCompanyAPIResponse,
    CreateCompanyDTOSchema,
    UpdateQuickBooksImportTimeDTOSchema,
} from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { GetAllLocationAddressesAPIResponse, GetLocationAddressAPIResponse } from "../location-address/types";

export interface ICompanyController {
    getCompanyById(_ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse> | Response>;
    createCompany(_ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse> | Response>;
    updateQuickbooksImportTime(ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse> | Response>;
    getCompanyLocationsById(ctx: Context): Promise<TypedResponse<GetAllLocationAddressesAPIResponse> | Response>;
}

export class CompanyController implements ICompanyController {
    private companyService: ICompanyService;

    constructor(service: ICompanyService) {
        this.companyService = service;
    }

    getCompanyById = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse>> => {
            const id = ctx.req.param("id");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
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
            });
        }
    );

    getCompanyLocationsById = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetAllLocationAddressesAPIResponse>> => {
            const id = ctx.req.param("id");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const locations = await this.companyService.getCompanyLocationsById({ id: id });
            return ctx.json(locations, 200);
        }
    )
}
