import { DataSource } from "typeorm";
import { UserPreferences } from "../../entities/UserPreferences";
import { UpdateUesrNotificationPreferencesDTO } from "../../types/Preferences";

export interface INotificationTransaction {
    getOrCreateUserPreferences(userId: string): Promise<UserPreferences>;
    updateUserPreferences(args: {
        userId: string;
        preferences: UpdateUesrNotificationPreferencesDTO;
    }): Promise<UserPreferences | null>;
}

export class NotificationTransaction implements INotificationTransaction {
    constructor(private db: DataSource) {}

    async getOrCreateUserPreferences(userId: string) {
        const repo = this.db.getRepository(UserPreferences);
        const preferences = await repo.findOneBy({ userId });

        if (!preferences) {
            await repo.insert({ userId });

            return await repo.findOneByOrFail({ userId });
        }

        return preferences;
    }

    async updateUserPreferences({
        userId,
        preferences,
    }: {
        userId: string;
        preferences: UpdateUesrNotificationPreferencesDTO;
    }) {
        const repo = this.db.getRepository(UserPreferences);
        await repo.update({ userId }, preferences);

        return repo.findOneBy({ userId });
    }
}
