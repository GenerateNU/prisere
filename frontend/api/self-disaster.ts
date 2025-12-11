"use server";

import {
    CreateSelfDisasterRequest,
    CreateSelfDisasterResponse,
    UpdateSelfDisasterRequest,
    UpdateSelfDisasterResponse,
} from "@/types/self-disaster";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const createSelfDisaster = async (
    payload: CreateSelfDisasterRequest
): Promise<ServerActionResult<CreateSelfDisasterResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreateSelfDisasterResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/disaster/self", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create self disaster" };
        }
    };
    return authWrapper<ServerActionResult<CreateSelfDisasterResponse>>()(req);
};

export const updateSelfDisaster = async (
    id: string,
    payload: UpdateSelfDisasterRequest
): Promise<ServerActionResult<UpdateSelfDisasterResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateSelfDisasterResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/disaster/self/{id}", {
            headers: authHeader(token),
            params: {
                path: { id },
            },
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update self disaster" };
        }
    };
    return authWrapper<ServerActionResult<UpdateSelfDisasterResponse>>()(req);
};
