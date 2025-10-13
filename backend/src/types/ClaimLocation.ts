import { z } from "zod";
import { LocationAddressSchema } from "./Location";

export const ClaimLocationSchema = z.object({
    id: z.uuid(),
    claimId: z.uuid(),
    locationAddressId: z.uuid(),
});

/* POST */
export const CreateClaimLocationDTOSchema = z.object({
    claimId: z.uuid(),
    locationAddressId: z.uuid(),
});

export const CreateClaimLocationResponseSchema = ClaimLocationSchema;

/* GET */
export const GetLocationsByCompanyIdDTOSchema = z.object({
    companyId: z.uuid(),
});

export const GetLocationsByCompanyIdResponseSchema = z.array(LocationAddressSchema);

/* DELETE */
export const DeleteClaimLocationDTOSchema = z.object({
    claimId: z.uuid(),
    locationId: z.uuid(),
});

export const DeleteClaimLocationDTOSchemaOpenAPI = z.object({
    cid: z.uuid(),
    lid: z.uuid(),
});

export const DeleteClaimLocationResponseSchema = z.object({
    success: z.boolean(),
});

/* Zod types for payload validation */
export type ClaimLocation = z.infer<typeof ClaimLocationSchema>;

export type CreateClaimLocationDTO = z.infer<typeof CreateClaimLocationDTOSchema>;
export type CreateClaimLocationResponse = z.infer<typeof CreateClaimLocationResponseSchema>;

export type GetLocationsByCompanyIdDTO = z.infer<typeof GetLocationsByCompanyIdDTOSchema>;
export type GetLocationsByCompanyIdResponse = z.infer<typeof GetLocationsByCompanyIdResponseSchema>;

export type DeleteClaimLocationDTO = z.infer<typeof DeleteClaimLocationDTOSchema>;
export type DeleteClaimLocationResponse = z.infer<typeof DeleteClaimLocationResponseSchema>;
