import { z } from "zod";
// Define the LocationAddress schema (assuming the structure based on CreateLocationAddressResponseSchema)
// If you have different fields in your LocationAddress entity, adjust accordingly
export const LocationAddressSchema = z.object({
    id: z.string(),
    country: z.string(),
    stateProvince: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    postalCode: z.number(),
    county: z.string().optional(),
});
export const LocationAddressWithClaimLocationSchema = LocationAddressSchema.extend({
    claimLocations: z.array(z.object({
        id: z.string().nonempty(),
    })).optional(),
});
export const CreateLocationAddressSchema = z.object({
    country: z.string().nonempty(),
    stateProvince: z.string().nonempty(),
    city: z.string().nonempty(),
    streetAddress: z.string().nonempty(),
    postalCode: z.number().positive(),
    county: z.string().nonempty().optional(),
});
export const CreateLocationAddressResponseSchema = z.object({
    id: z.string(),
    ...CreateLocationAddressSchema.shape,
});
export const GetLocationAddressSchema = z.object({
    id: z.string(),
});
export const GetLocationAddressResponseSchema = LocationAddressSchema;
