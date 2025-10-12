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
                name: "Test Company ABC",
                lastQuickBooksImportTime: new Date("2025-01-15T10:30:00Z"),
            },
            {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                name: "Test Company DEF",
            },
            {
                id: "12345678-9abc-1234-5678-56789abcdef0",
                name: "Test Company EFG",
                lastQuickBooksImportTime: new Date("2025-02-01T14:45:00Z"),
            },

            {
                id: "35fe231e-0635-49c7-9096-4b6a17b3639b",
                name: "Generate and Associates",
                lastQuickBooksImportTime: new Date("2023-02-01T12:00:00Z"),
            },
        ]);
    }
}
