import { Hono } from "hono";
import { CreartUserRequest, CreateUserDTO, CreateUserResponse } from "../../types/User";
import { CreateCompanyDTO, CreateCompanyResponse } from "../../types/Company";
import { TESTING_PREFIX } from "../../utilities/constants";

export async function createUser(app: Hono, request: CreartUserRequest) {
    const userResponse = await app.request(TESTING_PREFIX + "/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
        },
        body: JSON.stringify(request),
    });

    const responseData = (await userResponse.clone().json()) as unknown as CreateUserResponse;

    return { response: userResponse, data: responseData };
}

export async function createUserWithCompany(app: Hono, request: Omit<CreateUserDTO, "companyId">) {
    createUser(app, request);
    const companyResponse = await app.request(TESTING_PREFIX + "/companies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
        },
        body: JSON.stringify({ name: `company-${Math.random()}` } satisfies CreateCompanyDTO),
    });

    const companyId = ((await companyResponse.json()) as CreateCompanyResponse).id;

    const userResponse = await app.request(TESTING_PREFIX + "/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
        },
    });
    const responseData = (await userResponse.clone().json()) as unknown as CreateUserResponse;
    return { response: userResponse, data: responseData };
}
