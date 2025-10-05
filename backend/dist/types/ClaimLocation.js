import { z } from "zod";
import { LocationAddressSchema } from "./Location";
import { ClaimSchema } from "./Claim";
export const ClaimLocationSchema = z.object({
    id: z.string().nonempty(),
});
export const ClaimLocationWithRelationsSchema = ClaimLocationSchema.extend({
    location: LocationAddressSchema,
    claim: ClaimSchema,
});
/* POST */
export const CreateClaimLocationDTOSchema = ClaimLocationSchema;
export const CreateClaimLocationResponseSchema = ClaimLocationSchema;
/* GET */
export const GetClaimLocationsByCompanyIdDTOSchema = z.object({
    companyId: z.string().nonempty(),
});
export const GetClaimLocationsByCompanyIdResponseSchema = z.array(ClaimLocationSchema);
/* DELETE */
export const DeleteClaimLocationDTOSchema = z.object({
    id: z.string().nonempty(),
});
export const DeleteClaimLocationResponseSchema = z.object({
    id: z.string().nonempty(),
});
