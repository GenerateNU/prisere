import { z } from "zod";

export const insertFemaRiskIndexDataInputSchema = z.array(
    z.object({
        countyFipsCode: z.string(),
        riskRating: z.string(),
        ealRating: z.string(),
        socialVuln: z.string(),
        communityResilience: z.string(),
        coastalFlooding: z.string(),
        drought: z.string(),
        wildFire: z.string(),
    })
);

export const femaRiskIndexDataResultSchema = z.array(
    z.object({
        countyFipsCode: z.string(),
        riskRating: z.string(),
        ealRating: z.string(),
        socialVuln: z.string(),
        communityResilience: z.string(),
        coastalFlooding: z.string(),
        drought: z.string(),
        wildFire: z.string(),
        updatedAt: z.iso.date(),
        createdAt: z.iso.date(),
    })
);

export type InsertFemaRiskIndexDataInput = z.infer<typeof insertFemaRiskIndexDataInputSchema>;
export type FemaRiskIndexDataResult = z.infer<typeof femaRiskIndexDataResultSchema>;
