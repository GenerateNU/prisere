import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Company } from '../../entities/Company.js';

export default class CompanySeeder implements Seeder {
    track = false;
    public async run(
        dataSource: DataSource,
        _factoryManager: SeederFactoryManager
    ): Promise<any> {  
        const repository =  dataSource.getRepository(Company);
        await repository.insert([
            {
                id: "1",
                name: "Northeastern Inc.",
                lastQuickBooksImportTime: new Date("2023-01-01T12:00:00Z")
            }
        ]);
    }
}