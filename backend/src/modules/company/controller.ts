import { Context, TypedResponse } from "hono";
import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import {
    CreateCompanyDTOSchema,
    UpdateQuickBooksImportTimeDTOSchema,
    GetCompanyByIdResponse,
    CreateCompanyResponse,
    GetCompanyExternalResponse,
    HasCompanyDataDTOResponse,
} from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { ControllerResponse } from "../../utilities/response";
import { GetLocationAddressResponse } from "../../types/Location";
import { GetClaimInProgressForCompanyResponse } from "../../types/Claim";

export interface ICompanyController {
    getCompanyById(_ctx: Context): ControllerResponse<TypedResponse<GetCompanyByIdResponse, 200>>;
    createCompany(_ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 201>>;
    updateQuickbooksInvoiceImportTime(ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>>;
    updateQuickbooksPurchaseImportTime(ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>>;
    getCompanyLocationsById(ctx: Context): ControllerResponse<TypedResponse<GetLocationAddressResponse[], 200>>;
    getClaimInProgress(ctx: Context): ControllerResponse<TypedResponse<GetClaimInProgressForCompanyResponse, 200>>;
    getCompanyExternal(ctx: Context): ControllerResponse<TypedResponse<GetCompanyExternalResponse, 200>>;
    hasCompanyData(ctx: Context): ControllerResponse<TypedResponse<HasCompanyDataDTOResponse, 200>>;
}

export class CompanyController implements ICompanyController {
    private companyService: ICompanyService;

    constructor(service: ICompanyService) {
        this.companyService = service;
    }

    getCompanyById = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyByIdResponse, 200>> => {
            const id = ctx.get("companyId");
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
            const userId = ctx.get("userId");
            const company = await this.companyService.createCompany(payload, userId);
            return ctx.json(company, 201);
        }
    );

    updateQuickbooksInvoiceImportTime = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>> => {
            const companyId = ctx.get("companyId");
            const body = await ctx.req.json();

            const parseResult = UpdateQuickBooksImportTimeDTOSchema.safeParse({
                companyId,
                importTime: body.importTime ? new Date(body.importTime) : undefined,
            });

            if (!parseResult.success) {
                return ctx.json({ error: "Invalid request body: ", body }, 400);
            }

            const updated = await this.companyService.updateLastQuickBooksInvoiceImportTime(parseResult.data);
            if (!updated) {
                logMessageToFile("Company not found");
            }

            return ctx.json(
                {
                    ...updated,
                    ...(updated.lastQuickBooksInvoiceImportTime
                        ? {
                              lastQuickBooksInvoiceImportTime: new Date(
                                  updated.lastQuickBooksInvoiceImportTime
                              ).toISOString(),
                          }
                        : {}),
                    ...(updated.lastQuickBooksPurchaseImportTime
                        ? {
                              lastQuickBooksPurchaseImportTime: new Date(
                                  updated.lastQuickBooksPurchaseImportTime
                              ).toISOString(),
                          }
                        : {}),
                },
                200
            );
        }
    );

    updateQuickbooksPurchaseImportTime = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateCompanyResponse, 200>> => {
            const companyId = ctx.get("companyId");
            const body = await ctx.req.json();

            const parseResult = UpdateQuickBooksImportTimeDTOSchema.safeParse({
                companyId,
                importTime: body.importTime ? new Date(body.importTime) : undefined,
            });

            if (!parseResult.success) {
                return ctx.json({ error: "Invalid request body: ", body }, 400);
            }

            const updated = await this.companyService.updateLastQuickBooksPurchaseImportTime(parseResult.data);
            if (!updated) {
                logMessageToFile("Company not found");
            }

            return ctx.json(
                {
                    ...updated,
                    ...(updated.lastQuickBooksInvoiceImportTime
                        ? {
                              lastQuickBooksInvoiceImportTime: new Date(
                                  updated.lastQuickBooksInvoiceImportTime
                              ).toISOString(),
                          }
                        : {}),
                    ...(updated.lastQuickBooksPurchaseImportTime
                        ? {
                              lastQuickBooksPurchaseImportTime: new Date(
                                  updated.lastQuickBooksPurchaseImportTime
                              ).toISOString(),
                          }
                        : {}),
                },
                200
            );
        }
    );

    getCompanyLocationsById = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetLocationAddressResponse[], 200>> => {
            const id = ctx.get("companyId");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const locations = await this.companyService.getCompanyLocationsById({ id: id });
            return ctx.json(locations, 200);
        }
    );

    getClaimInProgress = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetClaimInProgressForCompanyResponse, 200>> => {
            const companyId = ctx.get("companyId");
            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const claim = await this.companyService.getClaimInProgress(companyId);

            // handles null claim as well
            return ctx.json(claim, 200);
        }
    );

    getCompanyExternal = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyExternalResponse, 200>> => {
            // const companyId = ctx.get("companyId");
            const companyId = '40fcc7c3-892c-44c9-bc79-0aebb1dd94a0';
            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const external = await this.companyService.getCompanyExternal(companyId);

            // handles null external as well
            return ctx.json(external, 200);
        }
    );

    hasCompanyData = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<HasCompanyDataDTOResponse, 200>> => {
            // const companyId = ctx.get("companyId");
            const companyId = '40fcc7c3-892c-44c9-bc79-0aebb1dd94a0';

            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const hasData = await this.companyService.hasCompanyData(companyId);

            // Had to create primitive boolean because zod types use that
            return ctx.json({ hasData }, 200);
        }
    );

}
