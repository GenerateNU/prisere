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

describe("DELETE /claim-locations/claim/id/location/id", () => {
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

    test("DELETE /claim-locations/claim/:cid/location-address/:lid - Success", async () => {
        const claimId = "3f4e5d6c-7b8a-9f0e-1d2c-3b4a5f6e7d8c";
        const locationAddressId = "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b";

        const response = await app.request(TESTING_PREFIX + `/claim-locations/claim/${claimId}/location-address/${locationAddressId}`, {
            method: "DELETE",
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({
            success: true,
        });
    });

    test("DELETE /claim-locations/claim/:cid/location-address/:lid - Link doesn't exist", async () => {
        const claimId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
        const locationAddressId = "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b";

        const response = await app.request(TESTING_PREFIX + `/claim-locations/claim/${claimId}/location-address/${locationAddressId}`, {
            method: "DELETE",
        });

        expect(response.status).toBe(500);
    });

    test("DELETE /claim-locations/claim/:cid/location-address/:lid - missing parameters", async () => {
        const claimId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
        const locationAddressId = undefined;

        const response = await app.request(TESTING_PREFIX + `/claim-locations/claim/${claimId}/location-address/${locationAddressId}`, {
            method: "DELETE",
        });

        expect(response.status).toBe(500);
    });

    test("DELETE /claim-locations/claim/:cid/location-address/:lid - malformed id", async () => {
        const claimId = "NANA";
        const locationAddressId = "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b";

        const response = await app.request(TESTING_PREFIX + `/claim-locations/claim/${claimId}/location-address/${locationAddressId}`, {
            method: "DELETE",
        });

        expect(response.status).toBe(500);
    });
});
