import z from "zod";
import { FIPSCounty, FIPSState, incidentTypeString } from "./common";
import { ErrorResponseSchema } from "../Utils";

export const GetAllDisastersResponseSchema = z.array(
    z.object({
        id: z.uuid(),
        disasterNumber: z.number(),
        fipsStateCode: FIPSState,
        declarationDate: z.iso.datetime(),
        incidentBeginDate: z.string().nullable(),
        incidentEndDate: z.string().nullable(),
        fipsCountyCode: FIPSCounty,
        declarationType: z.string().length(2),
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString,
    })
);

export const GetAllDisastersAPIResponseSchema = z.union([GetAllDisastersResponseSchema, ErrorResponseSchema]);

export type GetAllDisastersAPIResponse = z.infer<typeof GetAllDisastersAPIResponseSchema>;
