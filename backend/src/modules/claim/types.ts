import { z } from 'zod';
import { ClaimLocation } from "../../entities/ClaimLocation";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { LocationAddress } from "../../entities/LocationAddress";
import { GetPurchaseLineItemResponseSchema } from "../purchase-line-item/types";

export type ClaimWithSelectedRelations = {
    id: string;
    companyId: string;
    femaDisasterId?: string;
    selfDisasterId?: string;
    createdAt: Date;
    company?: CompanyInfo;
    femaDisaster?: FemaDisaster;
    selfDisaster?: SelfDisaster;
    claimLocations?: ClaimLocation[];
    purchaseLineItems?: PurchaseLineItem[];
};

const UserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional()
});

const CompanySchema = z.object({
    name: z.string(),
});

export const FemaDisasterSchema = z.object({
    id: z.string(),
    designatedIncidentTypes: z.string(),
    declarationDate: z.date(),
    incidentBeginDate: z.date().nullable().optional(),
    incidentEndDate: z.date().nullable().optional(),
});

export const SelfDisasterSchema = z.object({
    description: z.string(),
    startDate: z.date(),
    endDate: z.date().optional()
});

export const ImpactedLocationSchema = z.object({
    country: z.string(),
    stateProvince: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    postalCode: z.string(),
    county: z.string().nullable().optional(),
});

export const RelevantExpenseSchema = z.object({
    amount: z.number().gte(0),
    description: z.string(),
});

const ClaimDataSchema = z.object({
    user: UserSchema,
    company: CompanySchema,
    disaster: z.array(z.union([FemaDisasterSchema, SelfDisasterSchema])),
    impactedLocations: z.array(ImpactedLocationSchema),
    relevantExpenses: z.array(RelevantExpenseSchema),
    averageIncome: z.number().gte(0),
    dateGenerated: z.date(),
});

// Export types inferred from schemas
export type UserInfo = z.infer<typeof UserSchema>;
export type CompanyInfo = z.infer<typeof CompanySchema>;
export type FemaDisaster = z.infer<typeof FemaDisasterSchema>;
export type SelfDisaster = z.infer<typeof SelfDisasterSchema>;
export type ImpactedLocation = z.infer<typeof ImpactedLocationSchema>;
export type RelevantExpense = z.infer<typeof RelevantExpenseSchema>;
export type ClaimData = z.infer<typeof ClaimDataSchema>;