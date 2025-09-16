import { Context, TypedResponse } from "hono";
import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { GetCompanyByIdAPIResponse, CreateCompanyAPIResponse, GetCompanyByIdDTOSchema, CreateCompanyDTOSchema } from "../../types/Company";

export interface ICompanyController {
  getCompanyById(_ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse> | Response>;
  createCompany(_ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse> | Response>;
}

export class CompanyController implements ICompanyController {
  private companyService: ICompanyService;


  constructor(service: ICompanyService) {
    this.companyService = service;
  }
  
  getCompanyById = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<GetCompanyByIdAPIResponse>> => {
    const id = ctx.req.param("id");
    const companyIdResponse = await this.companyService.getCompanyById({id: id});
    return ctx.json(companyIdResponse, 200);
  })

  createCompany = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<CreateCompanyAPIResponse>> => {
    const json = await ctx.req.json();
    const payload = CreateCompanyDTOSchema.parse(json);
    const company = await this.companyService.createCompany(payload);
    return ctx.json(company, 201);
  })
}