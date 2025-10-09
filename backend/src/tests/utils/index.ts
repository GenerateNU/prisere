import { Hono } from "hono";
import { CreateUserDTO, CreateUserResponse } from "../../types/User";
import { CreateCompanyDTO, CreateCompanyResponse } from "../../types/Company";

export async function createUser(app: Hono, request: CreateUserDTO) {
    const userResponse = await app.request("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    const responseData = (await userResponse.clone().json()) as unknown as CreateUserResponse;

    return { response: userResponse, data: responseData };
}

export async function createUserWithCompany(app: Hono, request: Omit<CreateUserDTO, "companyId">) {
    const companyResponse = await app.request("/companies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: `company-${Math.random()}` } satisfies CreateCompanyDTO),
    });

    const companyId = ((await companyResponse.json()) as CreateCompanyResponse).id;

    return createUser(app, { ...request, companyId });
}
