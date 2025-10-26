"use server";

import { authHeader, authWrapper, getClient } from "./client";
import { CreateClaimLocationRequest, CreateClaimLocationResponse } from "@/types/claim-location";

export const createClaimLocationLink = async (payload: CreateClaimLocationRequest): Promise<CreateClaimLocationResponse> => {
    const req = async (token: string): Promise<CreateClaimLocationResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claim-locations", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            console.log(data);
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<CreateClaimLocationResponse>()(req);
}