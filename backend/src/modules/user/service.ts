import { User } from "../../entities/User";
import { IUserTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { GetUserDTO, CreateUserDTO, GetUserCompanyDTO, GetUserCompanyResponse } from "./types";

export interface IUserService {
    createUser(payload: CreateUserDTO): Promise<User>;
    getUser(payload: GetUserDTO): Promise<User>;
    getCompany(payload: GetUserCompanyDTO): Promise<GetUserCompanyResponse>;
}

export class UserService implements UserService {
    private userTransaction: IUserTransaction;

    constructor(UserTransaction: IUserTransaction) {
        this.userTransaction = UserTransaction;
    }

    createUser = withServiceErrorHandling(async (payload: CreateUserDTO): Promise<User> => {
        const user = await this.userTransaction.createUser(payload);
        if (!user) {
            throw Boom.internal("Creating User Failed");
        }
        return user;
    });

    getUser = withServiceErrorHandling(async (payload: GetUserDTO): Promise<User> => {
        const user = await this.userTransaction.getUser(payload);

        if (!user) {
            throw Boom.notFound("Unable to find the user with: ", payload);
        }
        return user;
    });

    getCompany = withServiceErrorHandling(async (payload: GetUserCompanyDTO): Promise<GetUserCompanyResponse> => {
        const company = await this.userTransaction.getCompany(payload);

        if (!company) {
            throw Boom.notFound("Unable to find the company from the User ID: ", payload);
        }

        return company;
    });
}
