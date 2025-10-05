import { User } from "../../entities/User.js";
export default class UserSeeder {
    track = false;
    async run(dataSource, _factoryManager) {
        const repository = dataSource.getRepository(User);
        await repository.insert([
            {
                firstName: "Zainab",
                lastName: "Imadulla",
                email: "zainab.imadulla@gmail.com",
            },
        ]);
    }
}
