import { z } from "zod";

export const RedirectEndpointSuccessParams = z.object({
    code: z.string(),
    state: z.string(),
    realmId: z.string(),
});

const RedirectEndpointErrorParams = z.object({
    error: z.enum(["access_denied"]),
    state: z.string(),
});

export const RedirectEndpointParams = z.union([RedirectEndpointSuccessParams, RedirectEndpointErrorParams]);

export * from "./invoice";
export * from "./purchase";
