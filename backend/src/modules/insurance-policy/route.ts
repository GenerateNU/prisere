import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IInsurancePolicyTransaction, InsurancePolicyTransaction } from "./transaction";
import { IInsurancePolicyService, InsurancePolicyService } from "./service";
import { IInsurancePolicyController, InsurancePolicyController } from "./controller";

export const insurancePolicyRoutes = (db: DataSource): Hono => {
    const insurancePolicy = new Hono();

    const insurancePolicyTransaction: IInsurancePolicyTransaction = new InsurancePolicyTransaction(db);
    const insurancePolicyService: IInsurancePolicyService = new InsurancePolicyService(insurancePolicyTransaction);
    const insurancePolicyController: IInsurancePolicyController = new InsurancePolicyController(insurancePolicyService);

    insurancePolicy.get("/", (ctx) => insurancePolicyController.getAllPolicies(ctx));
    insurancePolicy.post("/", (ctx) => insurancePolicyController.createInsurancePolicy(ctx));
    insurancePolicy.post("/bulk", (ctx) => insurancePolicyController.createInsureancePolicyBulk(ctx));

    return insurancePolicy;
};
