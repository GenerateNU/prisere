import z from "zod";

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

export type InsertFemaRiskIndexDataInput = z.infer<typeof insertFemaRiskIndexDataInputSchema>;
