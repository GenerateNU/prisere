import z from "zod";
import { FIPSCounty, FIPSState, incidentTypeString } from "./common";

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
