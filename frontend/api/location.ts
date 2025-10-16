import { CreateLocationRequest, Location } from "@/types/location";
import { authHeader, authWrapper, client } from "./client";

export const createLocation = async (payload: CreateLocationRequest): Promise<Location> => {
    console.log("hi");
    const req = async (token: string): Promise<Location> => {
        console.log("IN API");
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
