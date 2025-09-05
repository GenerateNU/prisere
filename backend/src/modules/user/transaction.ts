import { User } from "../../entities/User";
import { CreateUserDTO } from "../../types/User";
import { DataSource, InsertResult } from "typeorm";
import { plainToClass } from 'class-transformer';


export interface IUserTransaction {
    /**
     * Adds a new user to the database
     * @param payload User to be inserted into Database
     * @returns Promise resolving to inserted User or null if failed
     */
    createUser(payload: CreateUserDTO): Promise<User | null>;
}

export class UserTransaction implements UserTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
      this.db = db;
    }

    async createUser(payload: CreateUserDTO): Promise<User | null>{
        const user:User = plainToClass(User, payload);
        const result:InsertResult = await this.db.createQueryBuilder()
            .insert()
            .into(User)
            .values(user)
            .returning("*")
            .execute();
        return result.raw[0] ?? null;
    }

}