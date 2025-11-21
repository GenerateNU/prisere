"use server";
import {
    CreateLocationBulkRequest,
    CreateLocationRequest,
    Location,
    UpdateLocationBulkRequest,
    UpdateLocationBulkResponse,
    UpdateLocationRequest,
    UpdateLocationResponse,
} from "@/types/location";
import { authHeader, authWrapper, getClient } from "./client";
import { GetCompanyLocationsResponse } from "@/types/company";

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

export const createLocationBulk = async (payload: CreateLocationBulkRequest): Promise<Location[]> => {
    const req = async (token: string): Promise<Location[]> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/location-address/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<Location[]>()(req);
};

export const updateLocationAddress = async (payload: UpdateLocationRequest): Promise<UpdateLocationResponse> => {
    const req = async (token: string): Promise<UpdateLocationResponse> => {
        const client = getClient();
        console.log(payload);
        const { data, error, response } = await client.PATCH("/location-address", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateLocationResponse>()(req);
};

export const updateLocationAddressBulk = async (
    payload: UpdateLocationBulkRequest
): Promise<UpdateLocationBulkResponse> => {
    const req = async (token: string): Promise<UpdateLocationBulkResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/location-address/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateLocationBulkResponse>()(req);
};
