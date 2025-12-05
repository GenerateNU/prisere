import { afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { ContextVariables } from "../../types/Utils";
import { TESTING_PREFIX } from "../../utilities/constants";
import { initTestData, insertedClaims } from "../claim/setup";
import { startTestApp } from "../setup-tests";

describe("Get Company's Claim in Progress", () => {
    let app: Hono<{ Variables: ContextVariables }>;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    beforeEach(async () => {
        await initTestData(datasource);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET /companies/claim-in-progress - claim exists", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies/claim-in-progress`, {
            headers: {
                companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            },
        });
        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToExpected(insertedClaims[4], body);
    });

    test("GET /companies/claim-in-progress - no claim exists", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies/claim-in-progress`, {
            headers: {
                companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            },
        });
        expect(response.status).toBe(200);
        // returned a null body
        expect(response.bodyUsed).not;
    });

    test("GET /companies/claim-in-progress - error response structure", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(TESTING_PREFIX + `/companies/claim-in-progress`, {
            headers: {
                companyId: nonExistentUUID,
            },
        });
        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(typeof body.error).toBe("string");
    });

    test("GET /companies/claim-in-progress - id that does not exist", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(TESTING_PREFIX + `/companies/claim-in-progress`, {
            headers: {
                companyId: nonExistentUUID,
            },
        });
        expect(response.status).toBe(400);
    });
});

// Compare the ids, companyIds, disaster ids, and status
function CompareRequestToExpected(expected: any, response: any) {
    expect(expected.id).toBe(response.id);
    expect(expected.companyId).toBe(response.companyId);
    expect(expected.status).toBe(response.status);

    if (expected.femaDisasterId) {
        expect(expected.femaDisasterId).toBe(response.femaDisasterId);
    }

    if (expected.selfDisasterId) {
        expect(expected.selfDisasterId).toBe(response.selfDisasterId);
    }
}
