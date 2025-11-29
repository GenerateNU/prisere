import { z } from "zod";
import { CreateCompanyResponseSchema } from "./Company";

// Define the LocationAddress schema (assuming the structure based on CreateLocationAddressResponseSchema)
// If you have different fields in your LocationAddress entity, adjust accordingly
export const LocationAddressSchema = z.object({
    id: z.string(),
    alias: z.string(),
    country: z.string(),
    stateProvince: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    postalCode: z.string().nonempty().regex(/^\d+$/, {
        message: "Please enter a valid Postal Code. Must be a non-negative number.",
    }),
    county: z.string().optional(),
    companyId: z.uuid(),
    fipsStateCode: z.number(),
    fipsCountyCode: z.number(),
    lat: z.number(),
    long: z.number(),
});

export const LocationAddressSchemaType = z.object({
    id: z.string(),
    alias: z.string(),
    country: z.string(),
    stateProvince: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    postalCode: z.string().nonempty().regex(/^\d+$/, {
        message: "Please enter a valid Postal Code. Must be a non-negative number.",
    }),
    county: z.string().optional(),
    companyId: z.uuid(),
    fipsStateCode: z.number(),
    fipsCountyCode: z.number(),
    company: CreateCompanyResponseSchema,
});

export const CreateLocationAddressSchema = z.object({
    alias: z.string(),
    country: z.string().nonempty(),
    stateProvince: z.string().nonempty(),
    city: z.string().nonempty(),
    streetAddress: z.string().nonempty(),
    postalCode: z.string().nonempty().regex(/^\d+$/, {
        message: "Please enter a valid Postal Code. Must be a non-negative number.",
    }),
    county: z.string().nonempty().optional(),
});

export const CreateLocationAddressBulkSchema = z.array(CreateLocationAddressSchema).nonempty();

export const CreateLocationAddressResponseSchema = z.object({
    id: z.string(),
    ...CreateLocationAddressSchema.shape,
});

export const CreateLocationAddressBulkResponseSchema = z.array(CreateLocationAddressResponseSchema);

export const GetLocationAddressSchema = z.object({
    id: z.string(),
});

export const GetAllLocationAddressesSchema = z.array(
    z.object({
        id: z.string(),
        alias: z.string(),
        country: z.string().nonempty(),
        stateProvince: z.string().nonempty(),
        city: z.string().nonempty(),
        streetAddress: z.string().nonempty(),
        postalCode: z.string().nonempty().regex(/^\d+$/, {
            message: "Please enter a valid Postal Code. Must be a non-negative number.",
        }),
        county: z.string().nonempty().optional(),
        companyId: z.uuid(),
        fipsStateCode: z.number(),
        fipsCountyCode: z.number(),
        lat: z.number(),
        long: z.number(),
    })
);

export const UpdateLocationAddressDTOSchema = z.object({
    id: z.string(),
    alias: z.string().optional(),
    country: z.string().optional(),
    stateProvince: z.string().optional(),
    city: z.string().optional(),
    streetAddress: z.string().optional(),
    postalCode: z
        .string()
        .regex(/^\d+$/, {
            message: "Please enter a valid Postal Code. Must be a non-negative number.",
        })
        .optional(),
    county: z.string().optional().nullable(),
});

export const UpdateLocationAddressResponseSchema = CreateLocationAddressResponseSchema;

export const UpdateLocationAddressBulkDTOSchema = z.array(UpdateLocationAddressDTOSchema).nonempty();
export const UpdateLocationAddressBulkResponseSchema = z.array(UpdateLocationAddressResponseSchema);

// All types are now inferred from zod schemas
export type LocationAddress = z.infer<typeof LocationAddressSchema>;
export type CreateLocationAddressDTO = z.infer<typeof CreateLocationAddressSchema>;
export type CreateLocationAddressResponse = z.infer<typeof CreateLocationAddressResponseSchema>;
export type GetLocationAddressDTO = z.infer<typeof GetLocationAddressSchema>;
export type GetLocationAddressResponse = z.infer<typeof LocationAddressSchema>;
export type GetAllLocationAddressesResponse = z.infer<typeof GetAllLocationAddressesSchema>;
export type CreateLocationAddressBulkDTO = z.infer<typeof CreateLocationAddressBulkSchema>;
export type CreateLocationAddressBulkResponse = z.infer<typeof CreateLocationAddressBulkResponseSchema>;
export type UpdateLocationAddressDTO = z.infer<typeof UpdateLocationAddressDTOSchema>;
export type UpdateLocationAddressResponse = z.infer<typeof UpdateLocationAddressResponseSchema>;
export type UpdateLocationAddressBulkDTO = z.infer<typeof UpdateLocationAddressBulkDTOSchema>;
export type UpdateLocationAddressBulkResponse = z.infer<typeof UpdateLocationAddressBulkResponseSchema>;
