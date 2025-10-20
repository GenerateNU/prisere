import { Hono } from "hono";
import { beforeAll, beforeEach, describe, afterEach, test, expect } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { ClaimLocationSeeder } from "../../database/seeds/claimLocation.seed";
import { startTestApp } from "../setup-tests";
import CompanySeeder from "../../database/seeds/company.seed";
import { FemaDisasterSeeder } from "../../database/seeds/femaDisaster.seed";
import { ClaimSeeder } from "../../database/seeds/claim.seed";
import { LocationAddressSeeder } from "../../database/seeds/locationAddress.seed";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("POST /claim-locations", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);

        const disasterSeederr = new FemaDisasterSeeder();
        await disasterSeederr.run(dataSource, {} as SeederFactoryManager);

        const claimSeeder = new ClaimSeeder();
        await claimSeeder.run(dataSource, {} as SeederFactoryManager);

        const LocationAddress = new LocationAddressSeeder();
        await LocationAddress.run(dataSource, {} as SeederFactoryManager);

        const claimLocationSeeder = new ClaimLocationSeeder();
        await claimLocationSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /claim-locations - Success", async () => {
        const requestBody = {
            claimId: "bdf8bcfe-23e1-41b6-ba4f-e846efbaaebe", // Claim 5
            locationAddressId: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b", // Business Location 1
        };

        const response = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.claimId).toBe(requestBody.claimId);
        expect(body.locationAddressId).toBe(requestBody.locationAddressId);
    });

    test("POST /claim-locations - Unique Pairing Constraint violation", async () => {
        const requestBody = {
            claimId: "bdf8bcfe-23e1-41b6-ba4f-e846efbaaebe", // Claim 5
            locationAddressId: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b", // Business Location 1
        };

        await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const response2 = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response2.status).toBe(500);
    });

    test("POST /claim-locations - Claim doesn't exist", async () => {
        const requestBody = {
            claimId: "bdf8bcfe-23e1-41b6-ba4f-e846efbafebe", // Claim 5
            locationAddressId: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b", // Business Location 1
        };

        const response = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /claim-locations - Location doesn't exist", async () => {
        const requestBody = {
            claimId: "bdf8bcfe-23e1-41b6-ba4f-e826efbaaebe", // Claim 5
            locationAddressId: "5e6f7a8b-9c0f-1e2f-3a4b-5c6d7e8f9a0b", // Business Location 1
        };

        const response = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claim-locations - Invalid Id - claim", async () => {
        const requestBody = {
            claimId: "NANA", // Claim 5
            locationAddressId: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b", // Business Location 1
        };

        const response = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claim-locations - Invalid Id - location", async () => {
        const requestBody = {
            claimId: "bdf8bcfe-23e1-41b6-ba4f-e846efbaaebe", // Claim 5
            locationAddressId: "not an id", // Business Location 1
        };

        const response = await app.request(TESTING_PREFIX + "/claim-locations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });
});
