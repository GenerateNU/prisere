import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateInsurancePolicyBulkDTO,
    CreateInsurancePolicyBulkResponse,
    CreateInsurancePolicyDTO,
    CreateInsurancePolicyResponse,
    GetInsurancePoliciesResponse,
} from "./types";
import { IInsurancePolicyTransaction } from "./transaction";
import { InsurancePolicy } from "../../entities/InsurancePolicy";

export interface IInsurancePolicyService {
    createPolicy(payload: CreateInsurancePolicyDTO, companyId: string): Promise<CreateInsurancePolicyResponse>;
    createPolicyBulk(
        payload: CreateInsurancePolicyBulkDTO,
        companyId: string
    ): Promise<CreateInsurancePolicyBulkResponse>;
    getAllPolicies(companyId: string): Promise<GetInsurancePoliciesResponse>;
}

export class InsurancePolicyService implements IInsurancePolicyService {
    private policyTransaction: IInsurancePolicyTransaction;

    constructor(transaction: IInsurancePolicyTransaction) {
        this.policyTransaction = transaction;
    }

    createPolicy = withServiceErrorHandling(
        async (payload: CreateInsurancePolicyDTO, companyId: string): Promise<CreateInsurancePolicyResponse> => {
            const newPolicy = await this.policyTransaction.createPolicy(payload, companyId);

            if (!newPolicy) {
                throw Boom.internal("An error occured while trying to create a new policy");
            }

            return this.normalizePolicyEntity(newPolicy);
        }
    );

    createPolicyBulk = withServiceErrorHandling(
        async (
            payload: CreateInsurancePolicyBulkDTO,
            companyId: string
        ): Promise<CreateInsurancePolicyBulkResponse> => {
            const newPolicy = await this.policyTransaction.createPolicyBulk(payload, companyId);

            if (!newPolicy) {
                throw Boom.internal("An error occured while trying to create a new policy");
            }

            if (newPolicy.length !== payload.length) {
                throw Boom.internal(
                    `The number of policies created does not match the given number of policies: ${newPolicy.length}/${payload.length} created`
                );
            }

            return newPolicy.map(this.normalizePolicyEntity);
        }
    );

    getAllPolicies = withServiceErrorHandling(async (companyId: string): Promise<GetInsurancePoliciesResponse> => {
        const companyPolicies = await this.policyTransaction.getAllPolicies(companyId);
        return companyPolicies.map(this.normalizePolicyEntity);
    });

    private normalizePolicyEntity = (policy: InsurancePolicy) => {
        return {
            ...policy,
            companyId: undefined,
            updatedAt: policy.updatedAt.toISOString(),
            createdAt: policy.createdAt.toISOString(),
        };
    };
}
