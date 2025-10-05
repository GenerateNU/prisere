import { z } from "zod";
/* Zod schemas for OpenAPI docs */
/* Claim Schema */
export const ClaimSchema = z.object({
    id: z.string().nonempty(),
    status: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime().optional(),
    companyId: z.string(),
    disasterId: z.string(),
});
export const ClaimWithRelationsSchema = ClaimSchema.extend({
    claimLocations: z.array(z.object({
        id: z.string().nonempty(),
    })).optional(),
});
/* POST */
export const CreateClaimDTOSchema = z.object({
    id: z.string().nonempty(),
    status: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
    companyId: z.string(),
    disasterId: z.string(),
});
export const CreateClaimResponseSchema = ClaimSchema;
/* GET */
export const GetClaimDTOSchema = z.object({
    id: z.string().nonempty(),
});
export const GetClaimResponseSchema = ClaimSchema;
/* DELETE */
export const DeleteClaimDTOSchema = z.object({
    id: z.string().nonempty(),
});
export const DeleteClaimResponseSchema = z.object({
    id: z.string().nonempty(),
});
