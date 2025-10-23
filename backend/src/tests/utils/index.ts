import { Hono } from "hono";
import { CreartUserRequest, CreateUserDTO, CreateUserResponse } from "../../types/User";
import { CreateCompanyDTO } from "../../types/Company";
import { TESTING_PREFIX } from "../../utilities/constants";
import { DataSource } from "typeorm";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import dayjs from "dayjs";
import { CompanyExternal } from "../../entities/CompanyExternals";

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
    await app.request(TESTING_PREFIX + "/companies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
        },
        body: JSON.stringify({ name: `company-${Math.random()}` } satisfies CreateCompanyDTO),
    });

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

export async function setupQuickbooksSession(db: DataSource, { companyId }: { companyId: string }) {
    const now = dayjs();
    await db.getRepository(QuickbooksSession).insert({
        accessToken: "a",
        companyId,
        accessExpiryTimestamp: now.add(1, "hour").toDate(),
        refreshExpiryTimestamp: now.add(100, "days").toDate(),
        refreshToken: "r",
    });

    await db.getRepository(CompanyExternal).insert({
        source: "quickbooks",
        companyId,
        externalId: "quickbooks-id",
    });
}
