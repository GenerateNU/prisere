import { DataSource, In } from "typeorm";
import { InsurancePolicy } from "../../entities/InsurancePolicy";
import { CreateInsurancePolicyBulkDTO, CreateInsurancePolicyDTO } from "./types";

export interface IInsurancePolicyTransaction {
    createPolicy(payload: CreateInsurancePolicyDTO, companyId: string): Promise<InsurancePolicy | null>;
    createPolicyBulk(payload: CreateInsurancePolicyBulkDTO, companyId: string): Promise<InsurancePolicy[]>;
    getAllPolicies(companyId: string): Promise<InsurancePolicy[]>;
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
}
