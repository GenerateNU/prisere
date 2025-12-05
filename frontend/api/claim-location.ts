"use server";

import { authHeader, authWrapper, getClient } from "./client";
import { CreateClaimLocationRequest, CreateClaimLocationResponse } from "@/types/claim-location";
import { ServerActionResult } from "./types";

export const createClaimLocationLink = async (
    payload: CreateClaimLocationRequest
): Promise<ServerActionResult<CreateClaimLocationResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreateClaimLocationResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claim-locations", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create claim location link" };
        }
    };
    return authWrapper<ServerActionResult<CreateClaimLocationResponse>>()(req);
};
