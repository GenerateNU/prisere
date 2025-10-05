import { z } from "zod";
/* Zod schemas for OpenAPI docs */

/* Claim Schema */

export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.string(),
    createdAt: z.union([z.iso.datetime(), z.date()]),
    updatedAt: z.union([z.iso.datetime(), z.date()]).optional(),
    companyId: z.string(),
    disasterId: z.string(),
})

const stringClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    companyId: z.string(),
    disasterId: z.string(),
});

/* POST */
export const CreateClaimDTOSchema = z.object({
    companyId: z.string(),
    disasterId: z.string(),
});

export const CreateClaimResponseSchema = stringClaimSchema

/* GET */
export const GetClaimsByCompanyIdDTOSchema = z.object({
    companyId: z.string().nonempty(),
})

export const GetClaimsByCompanyIdResponseSchema = z.array(ClaimSchema);

/* DELETE */
export const DeleteClaimDTOSchema = z.object({
    id: z.string().nonempty(),
})

export const DeleteClaimResponseSchema = z.object({
    id: z.string().nonempty(),
})

/* Zod types for payload validation */
export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimWithRelations = z.infer<typeof ClaimSchema>;

export type CreateClaimDTO = z.infer<typeof CreateClaimDTOSchema>;
export type CreateClaimResponse = z.infer<typeof CreateClaimResponseSchema>;

export type GetClaimsByCompanyIdDTO = z.infer<typeof GetClaimsByCompanyIdDTOSchema>;
export type GetClaimsByCompanyIdResponse = z.infer<typeof GetClaimsByCompanyIdResponseSchema>;

export type DeleteClaimDTO = z.infer<typeof DeleteClaimDTOSchema>;
export type DeleteClaimResponse = z.infer<typeof DeleteClaimResponseSchema>;