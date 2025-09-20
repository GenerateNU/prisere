import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Company } from "../../entities/Company.js";

export default class CompanySeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Company);
        await repository.insert([
            {
                id: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                name: "Northeastern Inc.",
                lastQuickBooksImportTime: new Date("2023-01-01T12:00:00Z"),
            },
        ]);
    }
}
