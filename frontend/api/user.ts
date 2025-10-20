import { CreateUserRequest, User } from "@/types/user";
import { authHeader, authWrapper, getClient } from "./client";

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
    const req = async (token: string): Promise<User> => {
        const client = getClient(); 
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
    return authWrapper<User>()(req);
};
