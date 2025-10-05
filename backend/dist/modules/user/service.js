import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
export class UserService {
    userTransaction;
    constructor(UserTransaction) {
        this.userTransaction = UserTransaction;
    }
    createUser = withServiceErrorHandling(async (payload) => {
        const user = await this.userTransaction.createUser(payload);
        if (!user) {
            throw Boom.internal("Creating User Failed");
        }
        return user;
    });
    getUser = withServiceErrorHandling(async (payload) => {
        const user = await this.userTransaction.getUser(payload);
        if (!user) {
            throw Boom.notFound("Unable to find the user with: ", payload);
        }
        return user;
    });
    getCompany = withServiceErrorHandling(async (payload) => {
        const company = await this.userTransaction.getCompany(payload);
        if (!company) {
            throw Boom.notFound("Unable to find the company from the User ID: ", payload);
        }
        return company;
    });
}
