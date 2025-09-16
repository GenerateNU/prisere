import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

const FIPSState = z.number().gte(1).lte(56)

/* Zod schemas for OpenAPI docs */
export const CreateDisasterDTOSchema = z.object({
    id: z.string(),
    disaster_number : z.number(),
    state: FIPSState,
    declaration_date : z.iso.datetime(),
    start_date: z.iso.datetime().optional(),
    end_date: z.iso.datetime().optional(),
    fips_county_codes: z.number(),
    declaration_type: z.string(),
    designated_area: z.string(),
    designated_incident_types: z.string(),

});

export const CreateDisasterResponseSchema = z.object({
    id: z.string(),
    state: FIPSState,
    declaration_date : z.iso.datetime(),
    declaration_type: z.string(),
    designated_incident_types: z.string(),
    // maybe can add more to this success message
});

export const CreateDisasterAPIResponseSchema = z.union([
    CreateDisasterResponseSchema,
    ErrorResponseSchema
]);


export const GetAllDisastersResponseSchema = z.array(
    z.object({
        id: z.string(),
        disaster_number : z.number(),
        state: FIPSState,
        declaration_date : z.iso.datetime(),
        start_date: z.iso.datetime().optional(),
        end_date: z.iso.datetime().optional(),
        fips_county_codes: z.number(),
        declaration_type: z.string(),
        designated_area: z.string(),
        designated_incident_types: z.string(),
}));

export const GetAllDisastersAPIResponseSchema = z.union([
    GetAllDisastersResponseSchema,
    ErrorResponseSchema
]);

/* Zod types for payload validation */
export type CreateDisasterDTO = z.infer<typeof CreateDisasterDTOSchema>;
export type CreateDisasterResponse = z.infer<typeof CreateDisasterResponseSchema>;
export type CreateDisasterAPIResponse = z.infer<typeof CreateDisasterAPIResponseSchema>;
// missing types for disaster schemas???
