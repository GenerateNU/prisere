import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { InsurancePolicy } from "../../entities/InsurancePolicy";

export const insurancePolicySeedData = [
    {
        id: "a9847596-eb93-4026-8ad1-62ada283e0b6",
        policyHolderFirstName: "Sarah",
        policyHolderLastName: "Johnson",
        insuranceCompanyName: "Blue Cross Blue Shield",
        policyNumber: "BCBS-HL-456789",
        insuranceType: "Health",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
    },
    {
        id: "d2320343-e464-47c4-97a6-6b5ea795e095",
        policyHolderFirstName: "Michael",
        policyHolderLastName: "Chen",
        insuranceCompanyName: "Allstate",
        policyNumber: "ALL-HAZARD-334455",
        insuranceType: "Hazard",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
    },
    {
        id: "fe313539-91f6-4964-9638-ca0ae119da98",
        policyHolderFirstName: "Jessica",
        policyHolderLastName: "Taylor",
        insuranceCompanyName: "Liberty Mutual",
        policyNumber: "LM-PROP-556677",
        insuranceType: "Property",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
    },
    {
        id: "b66e671e-3f68-4c67-aee9-20cdf7250326",
        policyHolderFirstName: "Amanda",
        policyHolderLastName: "Brown",
        insuranceCompanyName: "Geico",
        policyNumber: "GEI-VEH-445566",
        insuranceType: "Auto",
        companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    },
];

export class InsurancePolicySeeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(InsurancePolicy, insurancePolicySeedData);
    }
}
