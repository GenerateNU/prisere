import z from "zod";
import { FIPSCounty, FIPSState, incidentTypeString } from "./common";
import { ErrorResponseSchema } from "../Utils";

export const GetAllDisastersResponseSchema = z.array(
    z.object({
        id: z.uuid(),
        disasterNumber: z.number(),
        state: FIPSState,
        declarationDate: z.iso.datetime(),
        startDate: z.iso.datetime().optional(),
        endDate: z.iso.datetime().optional(),
        fipsCountyCodes: FIPSCounty,
        declarationType: z.string(),
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString,
    })
);

export const GetAllDisastersAPIResponseSchema = z.union([GetAllDisastersResponseSchema, ErrorResponseSchema]);
