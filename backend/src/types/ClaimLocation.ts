import { z } from "zod";
import { LocationAddressSchema } from "./Location";
import { ClaimSchema } from "./Claim";

export const ClaimLocationSchema = z.object({
    id: z.string().nonempty(),
})

export const ClaimLocationWithRelationsSchema = ClaimLocationSchema.extend({
    location: LocationAddressSchema,
    claim: ClaimSchema,
})


/* POST */
export const CreateClaimLocationDTOSchema = ClaimLocationSchema;
export const CreateClaimLocationResponseSchema = ClaimLocationSchema;

/* GET */
export const GetClaimLocationsByCompanyIdDTOSchema = z.object({
    companyId: z.string().nonempty(),
})

export const GetClaimLocationsByCompanyIdResponseSchema = z.array(ClaimLocationSchema);

/* DELETE */
export const DeleteClaimLocationDTOSchema = z.object({
    id: z.string().nonempty(),
})

export const DeleteClaimLocationResponseSchema = z.object({
    id: z.string().nonempty(),
});

/* Zod types for payload validation */
export type ClaimLocation = z.infer<typeof ClaimLocationSchema>;
export type ClaimLocationWithRelations = z.infer<typeof ClaimLocationWithRelationsSchema>;

export type CreateClaimLocationDTO = z.infer<typeof CreateClaimLocationDTOSchema>;
export type CreateClaimLocationResponse = z.infer<typeof CreateClaimLocationResponseSchema>;

export type getClaimLocationsByCompanyIdDTO = z.infer<typeof GetClaimLocationsByCompanyIdDTOSchema>;
export type getClaimLocationsByCompanyIdResponse = z.infer<typeof GetClaimLocationsByCompanyIdResponseSchema>;

export type deleteClaimLocationDTO = z.infer<typeof DeleteClaimLocationDTOSchema>;
export type deleteClaimLocationResponse = z.infer<typeof DeleteClaimLocationResponseSchema>;
