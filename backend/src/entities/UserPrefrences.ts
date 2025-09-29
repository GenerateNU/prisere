import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";

export enum NotificationFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
}

@Entity("userPreferences")
export class UserPreferences {
    @PrimaryColumn("uuid")
    userId!: string;

    @OneToOne("user", "userPreferences", { onDelete: "CASCADE" }) // deleted preferences when user is deleted
    @JoinColumn({ name: "userId" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user!: any;

    @Column({ default: true })
    webNotifications!: boolean;

    @Column({ default: true })
    emailNotifications!: boolean;

    @Column({
        type: "enum",
        enum: NotificationFrequency,
        default: NotificationFrequency.DAILY,
    })
    notificationFrequency!: NotificationFrequency;
}
