import z from "zod";
import { FIPSCounty, FIPSState, incidentTypeString } from "./common";

export const GetAllDisastersResponseSchema = z.array(
    z.object({
        id: z.uuid(),
        disasterNumber: z.number(),
        fipsStateCode: FIPSState,
        declarationDate: z.union([z.date(), z.string()]),
        incidentBeginDate: z.string().optional(),
        incidentEndDate: z.string().optional(),
        fipsCountyCode: FIPSCounty,
        declarationType: z.string().length(2),
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString,
    })
);

export const GetAllDisastersDocumentResponseSchema = z.array(
    z.object({
        id: z.uuid(),
        disasterNumber: z.number(),
        fipsStateCode: FIPSState,
        declarationDate: z.union([z.date(), z.string()]),
        incidentBeginDate: z.union([z.date(), z.string()]).optional().nullable(),
        incidentEndDate: z.union([z.date(), z.string()]).optional().nullable(),
        fipsCountyCode: FIPSCounty,
        declarationType: z.string().length(2),
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString.nullable(),
    })
);

export const FemaDisasterSchema = z.array(
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

export type GetAllDisastersResponse = z.infer<typeof GetAllDisastersResponseSchema>;
