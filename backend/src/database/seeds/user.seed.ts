import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { User } from "../../entities/User.js";

export default class UserSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(User, [
            {
                firstName: "Zainab",
                lastName: "Imadulla",
                email: "zainab.imadulla@gmail.com",
            },
        ]);
    }
}
