import { z } from "zod";
import { ErrorResponseSchema } from "../../types/Utils";

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

export const CreateLocationAddressSchema = z.object({
    country: z.string().nonempty(),
    stateProvince: z.string().nonempty(),
    city: z.string().nonempty(),
    streetAddress: z.string().nonempty(),
    postalCode: z.number(),
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

export const CreateLocationAddressAPIResponseSchema = z.union([
    CreateLocationAddressResponseSchema,
    ErrorResponseSchema,
]);

export const GetLocationAddressAPIResponseSchema = z.union([GetLocationAddressResponseSchema, ErrorResponseSchema]);

// All types are now inferred from zod schemas
export type LocationAddress = z.infer<typeof LocationAddressSchema>;
export type CreateLocationAddressDTO = z.infer<typeof CreateLocationAddressSchema>;
export type CreateLocationAddressResponse = z.infer<typeof CreateLocationAddressResponseSchema>;
export type GetLocationAddressDTO = z.infer<typeof GetLocationAddressSchema>;
export type GetLocationAddressResponse = z.infer<typeof GetLocationAddressResponseSchema>;

// API Response types
export type CreateLocationAddressAPIResponse = z.infer<typeof CreateLocationAddressAPIResponseSchema>;
export type GetLocationAddressAPIResponse = z.infer<typeof GetLocationAddressAPIResponseSchema>;
