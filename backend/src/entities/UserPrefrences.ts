import { Entity, PrimaryColumn, Column , OneToOne, JoinColumn, Not} from "typeorm";
import { User } from "./User";

export enum NotificationFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly'
}

@Entity()
export class UserPreferences {
    @PrimaryColumn('uuid')
    userId!: string;

    @OneToOne(() => User, user => user.userPreferences, { onDelete: 'CASCADE' }) // deleted preferences when user is deleted
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ default: true })
    webNotifications!: boolean

    @Column({ default: true })
    emailNotifications!: boolean

    @Column({
        type: "enum",
        enum: NotificationFrequency,
        default: NotificationFrequency.DAILY
    })
    notificationFrequency!: NotificationFrequency
}