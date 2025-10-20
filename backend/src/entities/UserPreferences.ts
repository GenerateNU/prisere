import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation } from "typeorm";
import { User } from "./User";

export const USER_NOTIFICATION_FREQUENCY = ["daily", "weekly"] as const;
export type UserNotificationFrequency = (typeof USER_NOTIFICATION_FREQUENCY)[number];

@Entity()
export class UserPreferences {
    @Column()
    @PrimaryColumn()
    userId!: string;

    @OneToOne(() => User, (user) => user.preferences)
    @JoinColumn({ name: "userId" })
    user!: Relation<User>;

    @Column({ default: true })
    emailEnabled!: boolean;

    @Column({ default: true })
    webNotificationsEnabled!: boolean;

    @Column({ type: "enum", enum: USER_NOTIFICATION_FREQUENCY, default: "daily" satisfies UserNotificationFrequency })
    notificationFrequency!: UserNotificationFrequency;
}
