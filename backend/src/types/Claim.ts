import { z } from "zod";
import { ClaimStatusType } from "./ClaimStatusType";
/* Zod schemas for OpenAPI docs */

const claimStatusTypes = Object.keys(ClaimStatusType);

/* Claim Schema */

export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.enum(claimStatusTypes).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    companyId: z.string(),
    disasterId: z.string(),
});

const stringClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.enum(claimStatusTypes).default(ClaimStatusType.ACTIVE),
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

export const CreateClaimResponseSchema = stringClaimSchema;

/* GET */
export const GetClaimsByCompanyIdDTOSchema = z.object({
    id: z.string(),
});

export const GetClaimsByCompanyIdResponseSchema = z.array(ClaimSchema);

/* DELETE */
export const DeleteClaimDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const DeleteClaimResponseSchema = z.object({
    id: z.string().nonempty(),
});

/* Zod types for payload validation */
export type Claim = z.infer<typeof ClaimSchema>;
export type ClaimWithRelations = z.infer<typeof ClaimSchema>;

export type CreateClaimDTO = z.infer<typeof CreateClaimDTOSchema>;
export type CreateClaimResponse = z.infer<typeof CreateClaimResponseSchema>;

export type GetClaimsByCompanyIdDTO = z.infer<typeof GetClaimsByCompanyIdDTOSchema>;
export type GetClaimsByCompanyIdResponse = z.infer<typeof GetClaimsByCompanyIdResponseSchema>;

export type DeleteClaimDTO = z.infer<typeof DeleteClaimDTOSchema>;
export type DeleteClaimResponse = z.infer<typeof DeleteClaimResponseSchema>;
