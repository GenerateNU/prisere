import z from "zod";
import { FIPSState, incidentTypeString, LABEL_TO_CODE } from "./common";
import { ErrorResponseSchema } from "../Utils";

export const CreateDisasterDTOSchema = z
    .object({
        id: z.string(),
        disasterNumber: z.number(),
        fipsStateCode: z.coerce.number(),
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
        incidentType: z.string(),
    })
    .superRefine(({ startDate, endDate }, ctx) => {
        if (startDate && endDate && startDate > endDate) {
            ctx.addIssue({
                code: "custom",
                message: "Start date must be after or equal to end date",
            });
            return z.NEVER;
        }
    })
    .transform(({ designatedIncidentTypes, incidentType, ...rest }) => {
        const incidentTypeCode = LABEL_TO_CODE[incidentType];

        // designated incident types might be null, so turn it to empty string if null
        const currentCodes = (designatedIncidentTypes ?? "")
            .split(",").map((s) => s.trim())
            .filter((s) => s.trim() !== "")

        const mergedIncidentTypes = Array.from(new Set([...currentCodes, incidentTypeCode])).join(",");
        return {
            ...rest,
            designatedIncidentTypes : mergedIncidentTypes,
        };
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
