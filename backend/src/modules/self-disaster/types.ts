import z from "zod";
import { FIPSCounty, FIPSState, incidentTypeString } from "../../types/fema-disaster/common";

export const CreateSelfDisasterDTOSchema = z.object({
    companyId: z.string(),
    description: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date().optional(),
});

export const CreateSelfDisasterResponseSchema = z.object({
    id: z.string(),
    companyId: z.string(),
    description: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date().optional(),
    createdAt: z.iso.date(),
    updatedAt: z.iso.date(),
});

export type CreateSelfDisasterDTO = z.infer<typeof CreateSelfDisasterDTOSchema>;
export type CreateSelfDisasterResponse = z.infer<typeof CreateSelfDisasterResponseSchema>;

//Types not needed for deletion

export const GetDisastersForCompanyDTOSchema = z.object({
    companyId: z.string(),
    onlyActiveDisasters: z.boolean().default(false).optional(),
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
});

export const GetSelfDisasterForCompanyResponseSchema = z.object({
    id: z.string(),
    companyId: z.string(),
    description: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date().optional(),
    createdAt: z.iso.date(),
    updatedAt: z.iso.date(),
});

export const GetFemaDisasterForCompanyResponseSchema = z.object({
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
});

export const GetDisastersForCompanyResponseSchema = z.array(
    z.discriminatedUnion("disasterType", [
        GetSelfDisasterForCompanyResponseSchema,
        GetFemaDisasterForCompanyResponseSchema,
    ])
);

export type GetDisastersForCompanyDTO = z.infer<typeof GetDisastersForCompanyDTOSchema>;
export type GetSelfDisasterForCompanyResponse = z.infer<typeof GetSelfDisasterForCompanyResponseSchema>;
export type GetFemaDisasterForCompanyResponse = z.infer<typeof GetFemaDisasterForCompanyResponseSchema>;
export type GetDisastersForCompanyResponse = z.infer<typeof GetDisastersForCompanyResponseSchema>;
