import { UserPreferences } from "../../entities/UserPreferences";
import { UpdateUesrNotificationPreferencesDTO } from "../../types/Preferences";
import { withServiceErrorHandling } from "../../utilities/error";
import { IUserTransaction } from "../user/transaction";
import { IPreferenceTransaction } from "./transaction";
import Boom from "@hapi/boom";

export interface IPreferenceService {
    getUserPreferences(userId: string): Promise<UserPreferences | null>;
    updateUserPreferences(args: {
        userId: string;
        preferences: UpdateUesrNotificationPreferencesDTO;
    }): Promise<UserPreferences | null>;
}

export class PreferenceService implements IPreferenceService {
    constructor(
        private transaction: IPreferenceTransaction,
        private userTransaction: IUserTransaction
    ) {}

    getUserPreferences = withServiceErrorHandling(async (userId: string) => {
        const user = await this.userTransaction.getUser({ id: userId });

        if (!user) {
            return null;
        }

        return this.transaction.getOrCreateUserPreferences(userId);
    });

    updateUserPreferences = withServiceErrorHandling(
        async (args: { userId: string; preferences: UpdateUesrNotificationPreferencesDTO }) => {
            if (Object.keys(args.preferences).length === 0) {
                throw Boom.badRequest("Must contain values to update");
            }

            const user = await this.userTransaction.getUser({ id: args.userId });

            if (!user) {
                return null;
            }

            return this.transaction.updateUserPreferences(args);
        }
    );
}
