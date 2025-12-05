"use server";

import { FemaRisKIndexCountiesFemaDisaster } from "@/types/fema-risk-index";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const getFemaRiskIndexData = async (): Promise<ServerActionResult<FemaRisKIndexCountiesFemaDisaster>> => {
    const req = async (token: string): Promise<ServerActionResult<FemaRisKIndexCountiesFemaDisaster>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/fema-risk-index", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get FEMA risk index data" };
        }
    };
    return authWrapper<ServerActionResult<FemaRisKIndexCountiesFemaDisaster>>()(req);
};

export const refreshFemaRiskIndexData = async (): Promise<ServerActionResult<void>> => {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const { error, response } = await client.POST("/fema-risk-index", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: undefined };
        } else {
            return { success: false, error: error?.error || "Failed to refresh FEMA risk index data" };
        }
    };
    return authWrapper<ServerActionResult<void>>()(req);
};
