import { z } from "zod";

export const CreateInsurancePolicyDTOSchema = z.object({
    policyName: z.string().nonempty(),
    policyHolderFirstName: z.string().nonempty(),
    policyHolderLastName: z.string().nonempty(),
    insuranceCompanyName: z.string().nonempty(),
    policyNumber: z.string().nonempty(),
    insuranceType: z.string().nonempty(),
});

export const CreateInsurancePolicyBulkDTOSchema = z.array(CreateInsurancePolicyDTOSchema).nonempty();

export const SingleInsurancePolicyResponseSchema = z.object({
    id: z.string(),
    policyName: z.string(),
    policyHolderFirstName: z.string(),
    policyHolderLastName: z.string(),
    insuranceCompanyName: z.string(),
    policyNumber: z.string(),
    insuranceType: z.string(),
    updatedAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
});

export const SingleInsurancePolicyDocumentResponseSchema = z.object({
    id: z.string(),
    policyName: z.string(),
    policyHolderFirstName: z.string(),
    policyHolderLastName: z.string(),
    insuranceCompanyName: z.string(),
    policyNumber: z.string(),
    insuranceType: z.string(),
    updatedAt: z.string(),
    createdAt: z.string(),
});

export const UpdateInsurancePolicyDTOSchema = z.object({
    id: z.string(),
    policyName: z.string().optional(),
    policyHolderFirstName: z.string().optional(),
    policyHolderLastName: z.string().optional(),
    insuranceCompanyName: z.string().optional(),
    policyNumber: z.string().optional(),
    insuranceType: z.string().optional(),
});

export const UpdateInsurancePolicyBulkDTOSchema = z.array(UpdateInsurancePolicyDTOSchema).nonempty();

export const CreateInsurancePolicyResponseSchema = SingleInsurancePolicyResponseSchema;
export const CreateInsurancePolicyBulkResponseSchema = z.array(SingleInsurancePolicyResponseSchema).nonempty();
export const GetInsurancePoliciesResponseSchema = z.array(SingleInsurancePolicyResponseSchema);
export const UpdateInsurancePolicyResponseSchema = SingleInsurancePolicyResponseSchema;
export const UpdateInsurancePolicyBulkResponseSchema = z.array(SingleInsurancePolicyResponseSchema).nonempty();

//Controller Responses
export type CreateInsurancePolicyResponse = z.infer<typeof CreateInsurancePolicyResponseSchema>;
export type CreateInsurancePolicyBulkResponse = z.infer<typeof CreateInsurancePolicyBulkResponseSchema>;
export type GetInsurancePoliciesResponse = z.infer<typeof GetInsurancePoliciesResponseSchema>;
export type UpdateInsurancePolicyResponse = z.infer<typeof UpdateInsurancePolicyResponseSchema>;
export type UpdateInsurancePolicyBulkResponse = z.infer<typeof UpdateInsurancePolicyBulkResponseSchema>;

//Input types
export type CreateInsurancePolicyDTO = z.infer<typeof CreateInsurancePolicyDTOSchema>;
export type CreateInsurancePolicyBulkDTO = z.infer<typeof CreateInsurancePolicyBulkDTOSchema>;
export type UpdateInsurancePolicyDTO = z.infer<typeof UpdateInsurancePolicyDTOSchema>;
export type UpdateInsurancePolicyBulkDTO = z.infer<typeof UpdateInsurancePolicyBulkDTOSchema>;
