import { UserRequest, UserResponse } from "@/types/user";
import { authHeader, authWrapper, client } from "./client";

export const createUser = async (payload: UserRequest): Promise<UserResponse> => {
    const req = async (token: string): Promise<UserResponse> => {
      const { data } = await client.POST("/users", {
        headers: authHeader(token),
        body: payload,
      });
      return data!;
    };
    return authWrapper<UserResponse>()(req);
};
