'use server';
import { CreateLocationRequest, Location } from "@/types/location";
import { authHeader, authWrapper, getClient } from "./client";

export const createLocation = async (payload: CreateLocationRequest): Promise<Location> => {
    const req = async (token: string): Promise<Location> => {
        const client = getClient(); 
        const { data, error, response } = await client.POST("/location-address", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<Location>()(req);
};
