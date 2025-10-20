'use server';
import { CreateUserRequest, User } from "@/types/user";
import { authHeader, authWrapper, client } from "./client";

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
    console.log("Create user:", process.env.PROD_API_BASE_URL);
    const req = async (token: string): Promise<User> => {
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
