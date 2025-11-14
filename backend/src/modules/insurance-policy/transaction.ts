import { DataSource, In } from "typeorm";
import { InsurancePolicy } from "../../entities/InsurancePolicy";
import {
    CreateInsurancePolicyBulkDTO,
    CreateInsurancePolicyDTO,
    UpdateInsurancePolicyBulkDTO,
    UpdateInsurancePolicyDTO,
} from "./types";
import Boom from "@hapi/boom";

export interface IInsurancePolicyTransaction {
    createPolicy(payload: CreateInsurancePolicyDTO, companyId: string): Promise<InsurancePolicy | null>;
    createPolicyBulk(payload: CreateInsurancePolicyBulkDTO, companyId: string): Promise<InsurancePolicy[]>;
    getAllPolicies(companyId: string): Promise<InsurancePolicy[]>;
    updatePolicy(payload: UpdateInsurancePolicyDTO, companyId: string): Promise<InsurancePolicy | null>;
    updatePolicyBulk(payload: UpdateInsurancePolicyBulkDTO, companyId: string): Promise<InsurancePolicy[]>;
}

export class InsurancePolicyTransaction implements IInsurancePolicyTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createPolicy(payload: CreateInsurancePolicyDTO, companyId: string): Promise<InsurancePolicy | null> {
        const transformedPayload = { ...payload, companyId };
        const insertedPolicy = await this.db.manager.insert(InsurancePolicy, transformedPayload);
        const fullInsertedEntities = await this.db.manager.findOneBy(InsurancePolicy, {
            id: insertedPolicy.generatedMaps[0].id,
        });
        return fullInsertedEntities;
    }

    async createPolicyBulk(payload: CreateInsurancePolicyBulkDTO, companyId: string): Promise<InsurancePolicy[]> {
        const transformedPayload = payload.map((policy) => ({ ...policy, companyId }));
        const insertedPolicy = await this.db.manager.insert(InsurancePolicy, transformedPayload);
        const fullInsertedEntities = await this.db.manager.findBy(InsurancePolicy, {
            id: In(insertedPolicy.generatedMaps.map((element) => element.id)),
        });

        return fullInsertedEntities || [];
    }

    async getAllPolicies(companyId: string): Promise<InsurancePolicy[]> {
        return await this.db.manager.findBy(InsurancePolicy, { companyId });
    }

    async updatePolicy(payload: UpdateInsurancePolicyDTO, companyId: string): Promise<InsurancePolicy | null> {
        const updateResponse = await this.db.manager.update(InsurancePolicy, { id: payload.id }, payload);
        return updateResponse.affected === 1
            ? this.db.manager.findOneBy(InsurancePolicy, { id: payload.id, companyId: companyId })
            : null;
    }

    async updatePolicyBulk(payload: UpdateInsurancePolicyBulkDTO, companyId: string): Promise<InsurancePolicy[]> {
        const updatedPolicies: InsurancePolicy[] = [];

        await this.db.transaction(async (manager) => {
            for (const policy of payload) {
                const updateResponse = await manager.update(
                    InsurancePolicy,
                    { id: policy.id, companyId: companyId },
                    policy
                );
                if (updateResponse.affected === 1) {
                    const updatedPolicy = await manager.findOneBy(InsurancePolicy, { id: policy.id });
                    if (updatedPolicy) {
                        updatedPolicies.push(updatedPolicy);
                    }
                } else {
                    // will rollback the transaction if any update fails
                    throw Boom.internal(`Failed to update policy with ID: ${policy.id}`);
                }
            }
        });

        return updatedPolicies;
    }
}
