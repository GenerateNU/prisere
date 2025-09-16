import { CreateUserDTO } from "../../types/User";
import { User } from "../../entities/User";
import { IUserTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";

export interface IUserService {
    createUser(payload: CreateUserDTO): Promise<User>;
}

export class UserService implements UserService {
    private userTransaction: IUserTransaction;

    constructor(UserTransaction: IUserTransaction) {
        this.userTransaction = UserTransaction;
    }

    createUser = withServiceErrorHandling(async (payload: CreateUserDTO): Promise<User> => {
        const user = await this.userTransaction.createUser({
            ...payload,
        });
        if (!user) {
            throw Boom.internal("Creating User Failed");
        }
        return user;
    });
}
