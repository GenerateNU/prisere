"use server";

import {
    CreateSelfDisasterRequest,
    CreateSelfDisasterResponse,
    UpdateSelfDisasterRequest,
    UpdateSelfDisasterResponse,
} from "@/types/self-disaster";
import { authHeader, authWrapper, getClient } from "./client";

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
};

export const updateSelfDisaster = async (
    id: string,
    payload: UpdateSelfDisasterRequest
): Promise<UpdateSelfDisasterResponse> => {
    const req = async (token: string): Promise<UpdateSelfDisasterResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/disaster/self/{id}", {
            headers: authHeader(token),
            params: {
                path: { id },
            },
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateSelfDisasterResponse>()(req);
};
