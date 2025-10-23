import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import dayjs from "dayjs";
import { CompanyExternal } from "../../entities/CompanyExternals";

export default class QuickbooksSeeder implements Seeder {
    static COMPANY_ID = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
    static USER_ID = "0199e103-5452-76d7-8d4d-92e70c641bdb";
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const now = dayjs();

        await dataSource.manager.insert(CompanyExternal, [
            {
                companyId: QuickbooksSeeder.COMPANY_ID,
                externalId: "qb-external",
                source: "quickbooks",
            },
        ]);

        await dataSource.manager.insert(QuickbooksSession, [
            {
                companyId: QuickbooksSeeder.COMPANY_ID,
                accessExpiryTimestamp: now.add(1, "hour").toDate(),
                refreshExpiryTimestamp: now.add(100, "day").toDate(),
                accessToken: `a-${Math.random()}`,
                refreshToken: `r-${Math.random()}`,
            },
        ]);
    }
}
