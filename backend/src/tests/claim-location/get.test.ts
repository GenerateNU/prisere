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

describe("GET /claim-locations/company/:id", () => {
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

    test("GET /claim-locations/company - Success (multiple disasters, two locations)", async () => {
        const companyId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
        const response = await app.request(TESTING_PREFIX + `/claim-locations/company`, {
            headers: {
                companyId: companyId,
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(2);
        expect(body[0].id).toBe("8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f");
        expect(body[1].id).toBe("1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");
        expect(body[0].companyId).toBe(companyId);
        expect(body[1].companyId).toBe(companyId);
    });

    test("GET /claim-locations/company- Success (one disaster, one location)", async () => {
        const companyId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
        const response = await app.request(TESTING_PREFIX + `/claim-locations/company`, {
            headers: {
                companyId: companyId,
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(1);
        expect(body[0].companyId).toBe(companyId);
        expect(body[0].id).toBe("b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e");
    });

    test("GET /claim-locations/company - Company doesn't exist", async () => {
        const companyId = "f47ac10b-58cc-4372-j2009-0e02b2c35470";
        const response = await app.request(TESTING_PREFIX + `/claim-locations/company`, {
            headers: {
                companyId: companyId,
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /claim-locations/company - invalid UUID", async () => {
        const companyId = "invalid";
        const response = await app.request(TESTING_PREFIX + `/claim-locations/company`, {
            headers: {
                companyId: companyId,
            },
        });

        expect(response.status).toBe(400);
    });
});
