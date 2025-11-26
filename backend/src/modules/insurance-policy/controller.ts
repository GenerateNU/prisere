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
    UpdateInsurancePolicyBulkDTOSchema,
    UpdateInsurancePolicyBulkResponse,
    UpdateInsurancePolicyDTOSchema,
    UpdateInsurancePolicyResponse,
} from "./types";
import { validate } from "uuid";

export interface IInsurancePolicyController {
    getAllPolicies(_ctx: Context): ControllerResponse<TypedResponse<GetInsurancePoliciesResponse, 200>>;
    createInsurancePolicy(_ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyResponse, 201>>;
    createInsureancePolicyBulk(ctx: Context): ControllerResponse<TypedResponse<CreateInsurancePolicyBulkResponse, 201>>;
    updateInsurancePolicy(_ctx: Context): ControllerResponse<TypedResponse<UpdateInsurancePolicyResponse, 200>>;
    updateInsurancePolicyBulk(ctx: Context): ControllerResponse<TypedResponse<UpdateInsurancePolicyBulkResponse, 200>>;
    removeInsurancePolicyById(ctx: Context): Promise<Response>;
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

    updateInsurancePolicy = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<UpdateInsurancePolicyResponse, 200>> => {
            const json = await ctx.req.json();
            const payload = UpdateInsurancePolicyDTOSchema.parse(json);
            const companyId = ctx.get("companyId");

            const updateInsurancePolicyResponse = await this.insurancePolicyService.updatePolicy(payload, companyId);
            return ctx.json(updateInsurancePolicyResponse, 200);
        }
    );

    updateInsurancePolicyBulk = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<UpdateInsurancePolicyBulkResponse, 200>> => {
            const json = await ctx.req.json();
            const payload = UpdateInsurancePolicyBulkDTOSchema.parse(json);
            const companyId = ctx.get("companyId");

            const updateInsurancePolicyBulkResponse = await this.insurancePolicyService.updatePolicyBulk(
                payload,
                companyId
            );
            return ctx.json(updateInsurancePolicyBulkResponse, 200);
        }
    );

    removeInsurancePolicyById = withControllerErrorHandling(async (ctx: Context): Promise<Response> => {
        const maybeId = ctx.req.param("id");

        if (!validate(maybeId)) {
            return ctx.json({ error: "Invalid Insurance Policy ID was provided" }, 400);
        }

        const removal = await this.insurancePolicyService.removeInsurancePolicyById({ id: maybeId });
        if (removal.affected === 0) {
            return ctx.json({ error: "No insurance policy with that ID was found" }, 400);
        } else {
            ctx.status(204);
            return ctx.body(null);
        }
    });
}
