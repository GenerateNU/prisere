import { Hono } from "hono";
import { CreateUserAPIResponse, CreateUserDTO } from "../../types/User";
import { CreateCompanyDTO, CreateCompanyResponse } from "../../types/Company";

export async function createUserWithCompany(app: Hono, request: Omit<CreateUserDTO, "companyId">) {
    const companyResponse = await app.request("/companies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: `company-${Math.random()}` } satisfies CreateCompanyDTO),
    });

    const companyId = ((await companyResponse.json()) as CreateCompanyResponse).id;

    const userResponse = await app.request("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...request, companyId }),
    });

    const responseData = await userResponse.clone().json();

    return { response: userResponse, data: responseData as Extract<CreateUserAPIResponse, { id: string }> };
}
