"use server";
import { authHeader, authWrapper, getClient } from "./client";
import { CreateClaimRequest, CreateClaimResponse } from "@/types/claim";

export const createClaim = async (payload: CreateClaimRequest): Promise<CreateClaimResponse> => {
    const req = async (token: string): Promise<CreateClaimResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims", {
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
    return authWrapper<CreateClaimResponse>()(req);
}