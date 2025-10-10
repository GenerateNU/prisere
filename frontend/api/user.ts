import { CreateUserRequest, CreateUserResponse } from "@/types/user";
import { authHeader, authWrapper, client } from "./client";

export const createUser = async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
    const req = async (token: string): Promise<CreateUserResponse> => {
        const { data, error, response } = await client.POST("/users", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<CreateUserResponse>()(req);
};
