import { Context, TypedResponse } from "hono";
import { IInsurancePolicyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { ControllerResponse } from "../../utilities/response";
import {
    CreateInsurancePolicyBulkDTOSchema,
    CreateInsurancePolicyBulkResponse,
    CreateInsurancePolicyDTOSchema,
    CreateInsurancePolicyResponse,
    GetInsurancePoliciesResponse,
} from "./types";

export interface IInsurancePolicyController {
    getAllPolicies(_ctx: Context): ControllerResponse<TypedResponse<GetInsurancePoliciesResponse, 200>>;
    createInsurancePolicy(_ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyResponse, 201>>;
    createInsureancePolicyBulk(ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyBulkResponse, 201>>;
}

export class InsurancePolicyController implements IInsurancePolicyController {
    private insurancePolicyService: IInsurancePolicyService;

    constructor(service: IInsurancePolicyService) {
        this.insurancePolicyService = service;
    }

    getAllPolicies = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetInsurancePoliciesResponse, 200>> => {
            const id = ctx.get("companyId");

            const allPoliciesResponse = await this.insurancePolicyService.getAllPolicies(id);
            return ctx.json(allPoliciesResponse, 200);
        }
    );

    createInsurancePolicy = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateInsurancePolicyDTOSchema.parse(json);
            const id = ctx.get("companyId");

            const createInsureancPolicyResponse = await this.insurancePolicyService.createPolicy(payload, id);
            return ctx.json(createInsureancPolicyResponse, 201);
        }
    );

    createInsureancePolicyBulk = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyBulkResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateInsurancePolicyBulkDTOSchema.parse(json);
            const id = ctx.get("companyId");

            const createInsureancPolicyBulkResponse = await this.insurancePolicyService.createPolicyBulk(payload, id);
            return ctx.json(createInsureancPolicyBulkResponse, 201);
        }
    );
}
