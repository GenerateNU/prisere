import { User } from "../../entities/User";
import { plainToClass } from "class-transformer";
export class UserTransaction {
    db;
    constructor(db) {
        this.db = db;
    }
    async createUser(payload) {
        const user = plainToClass(User, payload);
        const result = await this.db.manager.save(User, user);
        return result ?? null;
    }
    async getUser(payload) {
        const { id: givenId } = payload;
        const result = await this.db.manager.findOne(User, { where: { id: givenId } });
        return result;
    }
    async getCompany(payload) {
        const { id: givenId } = payload;
        const result = await this.db.manager.findOne(User, {
            select: { company: true },
            where: { id: givenId },
            relations: { company: true },
        });
        //Check to make sure that the User entity and its associated company were found
        return result && result.company ? { companyId: result.company.id, companyName: result.company.name } : null;
    }
}
