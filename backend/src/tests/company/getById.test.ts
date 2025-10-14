/**
 *
 * - id that exists
 * - id that does not exist
 * - no id
 * - wrong type id (not string)
 * - SQL Injection...
 *
 */

import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach, afterEach} from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { logMessageToFile } from "../../utilities/logger";
import { TESTING_PREFIX } from "../../utilities/constants";
import { ContextVariables } from "../../types/Utils";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

describe("Example", () => {
    let app: Hono<{ Variables: ContextVariables }>;
    let backup: IBackup;
    let datasource: DataSource;
    const requestBody = {
        name: "Northeastern Inc.",
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

    });

    afterEach(async () => {
        backup.restore();
    });


    test("GET /companies/:id - id that exists", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies`, {
            headers: {
                "companyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
            }
        });
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
    });

    test("GET /companies/:id - validates response structure", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies`, {
            headers: {
                "companyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            }
        });
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("name");
        expect(body.id).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
        expect(typeof body.id).toBe("string");
        expect(typeof body.name).toBe("string");
    });

    test("GET /companies/:id - error response structure", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(TESTING_PREFIX + `/companies`, {
            headers: {
                "companyId": nonExistentUUID,
            }
        });
        expect(response.status).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(typeof body.error).toBe("string");
    });

    test("GET /companies/:id - id that does not exist", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(TESTING_PREFIX + `/companies`, {
            headers: {
                "companyId": nonExistentUUID,
            }
        } );
        expect(response.status).toBe(400);
    });

    test("GET /companies/:id - id not in UIUD format", async () => {
        const nonExistentUUID = "baka";
        const response = await app.request(TESTING_PREFIX + `/companies`, {
            headers: {
                "companyId": nonExistentUUID,
            }
        });
        expect(response.status).toBe(400);
    });

    test("GET /companies/:id - uuid with invalid characters", async () => {
        const response = await app.request(TESTING_PREFIX + "/companies", {
            headers: {
                "companyId": "1234567g-1234-1234-1234-123456789012",
            }
        } ); // g is not hex
        expect(response.status).toBe(400);
    });

    test("GET /companies/:id - no id", async () => {
        const response = await app.request(TESTING_PREFIX + "/companies/");
        expect([400, 404]).toContain(response.status);
    });

    test("GET /companies/:id - white space", async () => {
        const response = await app.request(TESTING_PREFIX + "/companies/   ");
        expect([400, 404]).toContain(response.status);
    });

    test("GET /companies/:id - concurrent requests", async () => {
        const requests = Array(10)
            .fill(null)
            .map(() => app.request(TESTING_PREFIX + `/companies`, {
                headers: {
                    "companyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                }
            }));

        const responses = await Promise.all(requests);
        responses.forEach((response) => {
            expect(response.status).toBe(200);
        });
    });
});
