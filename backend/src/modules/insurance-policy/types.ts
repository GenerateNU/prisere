import { z } from "zod";

export const CreateInsurancePolicyDTOSchema = z.object({
    policyHolderFirstName: z.string().nonempty(),
    policyHolderLastName: z.string().nonempty(),
    insuranceCompanyName: z.string().nonempty(),
    policyNumber: z.string().nonempty(),
    insuranceType: z.string().nonempty(),
});

export const CreateInsurancePolicyBulkDTOSchema = z.array(CreateInsurancePolicyDTOSchema).nonempty();

export const SingleInsurancePolicyResponseSchema = z.object({
    id: z.string(),
    policyHolderFirstName: z.string(),
    policyHolderLastName: z.string(),
    insuranceCompanyName: z.string(),
    policyNumber: z.string(),
    insuranceType: z.string(),
    updatedAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
});

export const CreateInsurancePolicyResponseSchema = SingleInsurancePolicyResponseSchema;
export const CreateInsurancePolicyBulkResponseSchema = z.array(SingleInsurancePolicyResponseSchema).nonempty();
export const GetInsurancePoliciesResponseSchema = z.array(SingleInsurancePolicyResponseSchema);

//Controller Responses
export type CreateInsurancePolicyResponse = z.infer<typeof CreateInsurancePolicyResponseSchema>;
export type CreateInsurancePolicyBulkResponse = z.infer<typeof CreateInsurancePolicyBulkResponseSchema>;
export type GetInsurancePoliciesResponse = z.infer<typeof GetInsurancePoliciesResponseSchema>;

//Input types
export type CreateInsurancePolicyDTO = z.infer<typeof CreateInsurancePolicyDTOSchema>;
export type CreateInsurancePolicyBulkDTO = z.infer<typeof CreateInsurancePolicyBulkDTOSchema>;
