import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { GetUserCompanyResponseSchema } from "../../types/User";
import { validate } from "uuid";
import { TESTING_PREFIX } from "../../utilities/constants";
import UserSeeder from "../../database/seeds/user.seed";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { DisasterSeeder } from "../../database/seeds/disaster.seed";
import { Company } from "../../entities/Company";
import { User } from "../../entities/User";
import { LocationAddress } from "../../entities/LocationAddress";
import { FemaDisaster } from "../../entities/FemaDisaster";

describe("GET /users/company", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const setup = await startTestApp();
        app = setup.app;
        backup = setup.backup;
        datasource = setup.dataSource;
    });

    afterEach(() => {
        backup.restore();
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const userSeeder = new UserSeeder();
        await userSeeder.run(datasource, {} as SeederFactoryManager);

        // Create a company and user manually for precise control
        const companyRepo = datasource.getRepository(Company);
        const userRepo = datasource.getRepository(User);
        const locationRepo = datasource.getRepository(LocationAddress);
        const disasterRepo = datasource.getRepository(FemaDisaster);

        // Create company
        const company = companyRepo.create({
            id: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            name: "Company Test",
            businessOwnerFullName: "Jane Doe",
        });
        await companyRepo.save(company);

        // Create user belonging to company
        const user = userRepo.create({
            id: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Test",
            lastName: "User",
            companyId: company.id,
        });
        await userRepo.save(user);

        // Create location for company with specific FIPS codes
        const location = locationRepo.create({
            alias: "HQ",
            country: "USA",
            stateProvince: "MA",
            city: "Boston",
            streetAddress: "123 Main St",
            postalCode: "02115",
            county: "Suffolk",
            companyId: company.id,
            fipsStateCode: 25,
            fipsCountyCode: 25,
        });
        await locationRepo.save(location);

        // Create a disaster with matching FIPS codes
        const disaster = disasterRepo.create({
            id: "11111111-1111-1111-1111-111111111111",
            fipsStateCode: 25,
            declarationDate: new Date("2025-01-08T00:00:00.000Z"),
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 25,
            incidentBeginDate: new Date("2025-01-08T00:00:00.000Z"),
            incidentEndDate: new Date("2025-02-08T00:00:00.000Z"),
        });
        await disasterRepo.save(disaster);

        // Optionally, seed other disasters that should NOT match
        const otherDisaster = disasterRepo.create({
            id: "22222222-2222-2222-2222-222222222222",
            fipsStateCode: 25,
            declarationDate: new Date("2025-01-08T00:00:00.000Z"),
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 25,
            incidentBeginDate: new Date("2025-01-08T00:00:00.000Z"),
            incidentEndDate: new Date("2025-02-08T00:00:00.000Z"),
        });
        await disasterRepo.save(otherDisaster);
    });

    test("should return 200 and company data when user exists and has a company", async () => {
        const response = await app.request(TESTING_PREFIX + `/users/getDisastersAffectingUser`, {
            method: "GET",
            headers: {
                userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            },
        });

        const responseBody = await response.json();
        // console.log(responseBody.length); 

        expect(response.status).toBe(200);
        expect(responseBody.length).toBe(2);

        expect(responseBody[0]).toHaveProperty("company");
        expect(responseBody[0]).toHaveProperty("disaster");
    });

});
