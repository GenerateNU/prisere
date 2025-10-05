import { Company } from "../../entities/Company.js";
export default class CompanySeeder {
    track = false;
    async run(dataSource, _factoryManager) {
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
