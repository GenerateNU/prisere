import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { User } from "../../entities/User.js";

export default class UserSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(User, [
            {
                id: "c34197fc-b944-4291-89ee-2e47ea77dc27",
                firstName: "Zainab",
                lastName: "Imadulla",
                email: "zainab.imadulla@gmail.com",
                phoneNumber: "1234567890",
            },
            {
                id: "0199e0cc-4e92-702c-9773-071340163ae4",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phoneNumber: "1234567890",
            },
            {
                id: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                firstName: "zahra",
                lastName: "wibisana",
                email: "zahra.wib@example.com",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                phoneNumber: "1234567890",
            },
        ]);
    }
}
