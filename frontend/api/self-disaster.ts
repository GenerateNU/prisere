"use server";

import { authHeader, authWrapper, getClient } from "./client";
import { CreateSelfDisasterRequest, CreateSelfDisasterResponse } from "@/types/self-disaster";

export const createSelfDisaster = async (payload: CreateSelfDisasterRequest): Promise<CreateSelfDisasterResponse> => {
    const req = async (token: string): Promise<CreateSelfDisasterResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/disaster/self", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<CreateSelfDisasterResponse>()(req);
}