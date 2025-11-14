import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import UserSeeder from "../../database/seeds/user.seed";
import { Company } from "../../entities/Company";
import { User } from "../../entities/User";
import { LocationAddress } from "../../entities/LocationAddress";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { Purchase } from "../../entities/Purchase";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import { CompanyService } from "../../modules/company/service";
import { CompanyTransaction } from "../../modules/company/transaction";
import { ClaimTransaction } from "../../modules/claim/transaction";

describe("Company - Update lastQuickBooksImportTime", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    let companyTransaction: CompanyTransaction;
    let claimTransaction: ClaimTransaction;
    let companyService: CompanyService;
    let companyWithNoData: Company;
    let companyWithPurchaseData: Company;
    let companyWithExternal: Company;
    let companyWithInvoiceData: Company;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
        companyTransaction = new CompanyTransaction(datasource);
        claimTransaction = new ClaimTransaction(datasource);
        companyService = new CompanyService(companyTransaction, claimTransaction);
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);
        const userSeeder = new UserSeeder();
        await userSeeder.run(datasource, {} as SeederFactoryManager);

        const companyRepo = datasource.getRepository(Company);
        const userRepo = datasource.getRepository(User);
        const purchaseRepo = datasource.getRepository(Purchase);
        const companyExternalRepo = datasource.getRepository("CompanyExternal");

        // Create company
        companyWithPurchaseData = companyRepo.create({
            id: "fac8243b-876e-4b6d-8b80-ffc73522a838",
            name: "Company Test",
            businessOwnerFullName: "Jane Doe",
        });
        await companyRepo.save(companyWithPurchaseData);
        companyWithNoData = companyRepo.create({
            id: "fbc8243b-876e-4b6d-8b80-ffc73522a838",
            name: "Company Test",
            businessOwnerFullName: "Jane Doe",
        });
        await companyRepo.save(companyWithNoData);
        companyWithExternal = companyRepo.create({
            id: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            name: "Company Test",
            businessOwnerFullName: "Jane Doe",
        });
        await companyRepo.save(companyWithExternal);

        // Create user belonging to company
        const userWithPurchase = userRepo.create({
            id: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Test",
            lastName: "User",
            companyId: companyWithPurchaseData.id,
        });
        await userRepo.save(userWithPurchase);

        const userWithQBClient = userRepo.create({
            id: "0299e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Test",
            lastName: "User",
            companyId: companyWithExternal.id,
        });
        await userRepo.save(userWithQBClient);

        const userWithNoData = userRepo.create({
            id: "0399e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Test",
            lastName: "User",
            companyId: companyWithNoData.id,
        });
        await userRepo.save(userWithNoData);

        const purchase = purchaseRepo.create({
            id: "1ffac23a-aefa-45ef-b0bd-b2b72ceae12e",
            companyId: companyWithPurchaseData.id,
            quickBooksId: 2108347,
            totalAmountCents: 5678,
            isRefund: false,
            dateCreated: new Date("2025-01-11T12:00:00Z"),
            quickbooksDateCreated: new Date("2025-01-11T12:00:00Z"),
        })
        await purchaseRepo.save(purchase);

        const companyExternal = companyExternalRepo.create({
            source: "quickbooks", 
            externalId: "test-qb-external-id",
            companyId: companyWithExternal.id,
            company: companyWithExternal,
        });
        await companyExternalRepo.save(companyExternal);

        companyWithInvoiceData = companyRepo.create({
            id: "abc8243b-876e-4b6d-8b80-ffc73522a838",
            name: "Company With Invoice",
            businessOwnerFullName: "Jane Doe",
        });
        await companyRepo.save(companyWithInvoiceData);

        // Create user for invoice company
        const userWithInvoice = userRepo.create({
            id: "0499e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Test",
            lastName: "User",
            companyId: companyWithInvoiceData.id,
        });
        await userRepo.save(userWithInvoice);

        // Create invoice for the company
        const invoiceRepo = datasource.getRepository("Invoice");
        const invoice = invoiceRepo.create({
            companyId: companyWithInvoiceData.id,
            totalAmountCents: 12345,
            quickbooksId: 999999,
            dateCreated: new Date("2025-01-12T12:00:00Z"),
            lastUpdated: new Date("2025-01-12T12:00:00Z"),
            quickbooksDateCreated: new Date("2025-01-12T12:00:00Z"),
        });
        await invoiceRepo.save(invoice);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET company that does not have data", async () => {
        const hasData = await companyService.hasCompanyData(companyWithNoData.id)
        expect(hasData).toBe(false);
    });

    test("GET company that does have data from purchase data", async () => {
        const hasData = await companyService.hasCompanyData(companyWithPurchaseData.id)
        expect(hasData).toBe(true);
    });

    test("GET company that does have data with company external", async () => {
        const hasData = await companyService.hasCompanyData(companyWithExternal.id)
        expect(hasData).toBe(true);
    });

    test("GET company that does have data from invoice", async () => {
        const hasData = await companyService.hasCompanyData(companyWithInvoiceData.id);
        expect(hasData).toBe(true);
    });

});
