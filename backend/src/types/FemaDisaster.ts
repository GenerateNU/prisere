import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

/* Zod schemas for OpenAPI docs */
export const CreateDisasterDTOSchema = z.object({
    id: z.string(),
    state: z.number().min(2).max(2),
    declaration_date : z.date(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    fips_county_codes: z.number().min(3).max(3),
    declaration_type: z.string(),
    designated_area: z.string(),
    designated_incident_types: z.string(),
});

export const CreateDisasterResponseSchema = z.object({
    id: z.string(),
    state: z.number().min(2).max(2),
    declaration_date : z.date(),
    declaration_type: z.string(),
    designated_incident_types: z.string(),
    // maybe can add more to this success message
});

export const CreateDisasterAPIResponseSchema = z.union([
    CreateDisasterResponseSchema,
    ErrorResponseSchema
]);

/* Zod types for payload validation */
export type CreateDisasterDTO = z.infer<typeof CreateDisasterDTOSchema>;
export type CreateDisasterResponse = z.infer<typeof CreateDisasterResponseSchema>;
export type CreateDisasterAPIResponse = z.infer<typeof CreateDisasterAPIResponseSchema>;
