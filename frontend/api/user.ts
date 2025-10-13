import { CreateUserRequest, CreateUserResponse } from "@/types/user";
import { authHeader, authWrapper, client } from "./client";
import { GetUserCompanyResponse } from "../types/user";

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

export const getUserCompany = async (userId: string): Promise<GetUserCompanyResponse> => {
    const req = async (token: string): Promise<GetUserCompanyResponse> => {
        const { data, error, response } = await client.GET(`/users/{id}/company`, {
            params: {
                path: { id: userId },
            },
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetUserCompanyResponse>()(req);
};
