import z from "zod";
import { FIPSState, incidentTypeString } from "./common";
import { ErrorResponseSchema } from "../Utils";

export const CreateDisasterDTOSchema = z
    .object({
        femaId: z.string(),
        disasterNumber: z.number(),
        state: z.coerce.number(),
        declarationDate: z.iso.datetime(),
        startDate: z.iso.datetime().optional(),
        endDate: z.iso.datetime().optional(),
        fipsCountyCode: z.coerce.number(),
        /**
         * 2 character code for emergency declaration: major disaster, fire management, or emergency declaration
         */
        declarationType: z.string().length(2),
        /**
         * typically structured as "[county] (County)"
         */
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString,
    })
    .superRefine(({ startDate, endDate }, ctx) => {
        if (startDate && endDate && startDate > endDate) {
            ctx.addIssue({
                code: "custom",
                message: "Start date must be after or equal to end date",
            });
            return z.NEVER;
        }
    });

export const CreateDisasterResponseSchema = z.object({
    femaId: z.uuid(),
    state: FIPSState,
    declarationDate: z.iso.datetime(),
    declarationType: z.string().length(2),
    designatedIncidentTypes: incidentTypeString,
});

export const CreateDisasterAPIResponseSchema = z.union([CreateDisasterResponseSchema, ErrorResponseSchema]);

export type CreateDisasterDTO = z.infer<typeof CreateDisasterDTOSchema>;
export type CreateDisasterResponse = z.infer<typeof CreateDisasterResponseSchema>;
export type CreateDisasterAPIResponse = z.infer<typeof CreateDisasterAPIResponseSchema>;
