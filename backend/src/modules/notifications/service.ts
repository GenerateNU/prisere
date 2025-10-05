import { UserPreferences } from "../../entities/UserPreferences";
import { UpdateUesrNotificationPreferencesDTO } from "../../types/Preferences";
import { withServiceErrorHandling } from "../../utilities/error";
import { IUserTransaction } from "../user/transaction";
import { INotificationTransaction } from "./transaction";

export interface INotificationService {
    getUserPreferences(userId: string): Promise<UserPreferences | null>;
    updateUserPreferences(args: {
        userId: string;
        preferences: UpdateUesrNotificationPreferencesDTO;
    }): Promise<UserPreferences | null>;
}

export class NotificationService implements INotificationService {
    constructor(
        private transaction: INotificationTransaction,
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
            const user = await this.userTransaction.getUser({ id: args.userId });

            if (!user) {
                return null;
            }

            return this.transaction.updateUserPreferences(args);
        }
    );
}
