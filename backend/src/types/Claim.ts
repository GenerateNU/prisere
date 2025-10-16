import { z } from "zod";
import { ClaimStatusType } from "./ClaimStatusType";
import { GetAllDisastersResponseSchema } from "./fema-disaster";
import { GetSelfDisasterForCompanyResponseSchema } from "../modules/self-disaster/types";
/* Zod schemas for OpenAPI docs */

/* Claim Schema */

export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    companyId: z.string(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(), // .element extracts the item schema
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
});

const stringClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.nativeEnum(ClaimStatusType).default(ClaimStatusType.ACTIVE),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    companyId: z.string(),
    femaDisaster: GetAllDisastersResponseSchema.element.optional(),
    selfDisaster: GetSelfDisasterForCompanyResponseSchema.optional(),
});

/* POST */
export const CreateClaimDTOSchema = z.object({
    companyId: z.string(),
    femaDisasterId: z.string().optional(),
    selfDisasterId: z.string().optional(),
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
