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
import { ServerActionResult } from "./types";

export const createLocation = async (payload: CreateLocationRequest): Promise<ServerActionResult<Location>> => {
    const req = async (token: string): Promise<ServerActionResult<Location>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/location-address", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create location" };
        }
    };
    return authWrapper<ServerActionResult<Location>>()(req);
};

export const createLocationBulk = async (
    payload: CreateLocationBulkRequest
): Promise<ServerActionResult<Location[]>> => {
    const req = async (token: string): Promise<ServerActionResult<Location[]>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/location-address/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create locations" };
        }
    };
    return authWrapper<ServerActionResult<Location[]>>()(req);
};

export const updateLocationAddress = async (
    payload: UpdateLocationRequest
): Promise<ServerActionResult<UpdateLocationResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateLocationResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/location-address", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update location" };
        }
    };
    return authWrapper<ServerActionResult<UpdateLocationResponse>>()(req);
};

export const updateLocationAddressBulk = async (
    payload: UpdateLocationBulkRequest
): Promise<ServerActionResult<UpdateLocationBulkResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateLocationBulkResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/location-address/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update locations" };
        }
    };
    return authWrapper<ServerActionResult<UpdateLocationBulkResponse>>()(req);
};

export const deleteLocation = async (locationId: string): Promise<ServerActionResult<void>> => {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const { error, response } = await client.DELETE("/location-address/{id}", {
            headers: authHeader(token),
            params: {
                path: {
                    id: locationId,
                },
            },
        });
        if (response.ok) {
            return { success: true, data: undefined };
        } else {
            return { success: false, error: error?.error || "Failed to delete location" };
        }
    };
    return authWrapper<ServerActionResult<void>>()(req);
};
