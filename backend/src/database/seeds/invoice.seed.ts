import { DataSource } from "typeorm";
import { Invoice } from "../../entities/Invoice";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export default class InvoiceSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Invoice);
        await repository.insert([
            {
                id: "1b53822d-eae9-4948-aaaf-c71c4adcdb5a",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                quickbooksId: 1,
                totalAmountCents: 234,
                dateCreated: new Date("2025-02-05T12:00:00Z"),
            },
        ]);
    }
}