import Boom from "@hapi/boom";
import { User } from "../../entities/User";
import { CreateUserDTO, GetUserCompanyDTO, GetUserCompanyResponse, GetUserDTO, UpdateUserDTO } from "../../types/User";
import { withServiceErrorHandling } from "../../utilities/error";
import { IUserTransaction } from "./transaction";

export interface IUserService {
    createUser(payload: CreateUserDTO): Promise<User>;
    getUser(payload: GetUserDTO): Promise<User>;
    getCompany(payload: GetUserCompanyDTO): Promise<GetUserCompanyResponse>;
    updateUser(payload: UpdateUserDTO): Promise<User>;
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
        const user = await this.userTransaction.getCompany(payload);

        if (!user) {
            throw Boom.notFound("Unable to find the company from the User ID: ", payload);
        }

        return { companyId: user.company.id, companyName: user.company.name };
    });

    updateUser = withServiceErrorHandling(async (payload: UpdateUserDTO): Promise<User> => {
        const user = await this.userTransaction.updateUser(payload);
        if (!user) {
            throw Boom.internal("Updating User Failed");
        }
        return user;
    });
}
