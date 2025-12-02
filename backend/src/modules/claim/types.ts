import { z } from "zod";
import { ClaimLocation } from "../../entities/ClaimLocation";
import { CompanyTypesEnum } from "../../entities/Company";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { User } from "../../entities/User";

export const ClaimPDFGenerationResponseSchema = z.object({
    url: z.url(),
});

export type ClaimDataForPDF = {
    id: string;
    companyId: string;
    femaDisasterId?: string;
    selfDisasterId?: string;
    company?: CompanyInfo;
    femaDisaster?: FemaDisasterInfo;
    selfDisaster?: SelfDisasterInfo;
    claimLocations?: ClaimLocation[];
    purchaseLineItems?: PurchaseLineItem[];
    user: User;
    averageIncome: number;
    pastRevenues: { year: number; amountCents: number }[];
    pastPurchases: { year: number; amountCents: number }[];
};

export const UserInfoSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
});

const CompanySchema = z.object({
    name: z.string(),
    businessOwnerFullName: z.string().optional(),
    companyType: z.enum(CompanyTypesEnum).optional(),
});

export const FemaDisasterInfoSchema = z.object({
    id: z.string(),
    designatedIncidentTypes: z.string(),
    declarationDate: z.date(),
    incidentBeginDate: z.date().nullable().optional(),
    incidentEndDate: z.date().nullable().optional(),
});

export const SelfDisasterInfoSchema = z.object({
    description: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
});

export const ImpactedLocationSchema = z.object({
    alias: z.string().optional(),
    country: z.string(),
    stateProvince: z.string(),
    city: z.string(),
    streetAddress: z.string(),
    postalCode: z.string(),
    county: z.string().nullable().optional(),
});

export const RelevantExpenseSchema = z.object({
    amountCents: z.number().gte(0),
    description: z.string().nullable(),
});

export const PastExpensesSchema = z.array(z.object({ year: z.number(), amountCents: z.number().gte(0) }));

export const ClaimDataSchema = z.object({
    user: UserInfoSchema,
    company: CompanySchema,
    femaDisaster: FemaDisasterInfoSchema.optional(),
    selfDisaster: SelfDisasterInfoSchema.optional(),
    impactedLocations: z.array(ImpactedLocationSchema),
    relevantExpenses: z.array(RelevantExpenseSchema),
    averageIncome: z.number().gte(0),
    dateGenerated: z.date(),
    pastRevenues: PastExpensesSchema,
    pastPurchases: PastExpensesSchema,
});

export type ClaimPDFGenerationResponse = z.infer<typeof ClaimPDFGenerationResponseSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type CompanyInfo = z.infer<typeof CompanySchema>;
export type FemaDisasterInfo = z.infer<typeof FemaDisasterInfoSchema>;
export type SelfDisasterInfo = z.infer<typeof SelfDisasterInfoSchema>;
export type ImpactedLocation = z.infer<typeof ImpactedLocationSchema>;
export type RelevantExpense = z.infer<typeof RelevantExpenseSchema>;
export type ClaimData = z.infer<typeof ClaimDataSchema>;
