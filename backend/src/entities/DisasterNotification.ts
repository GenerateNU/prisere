import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FemaDisaster } from "./FemaDisaster";
import { User } from "./User";
import { NotificationType, NotificationStatus } from "../types/NotificationEnums";

@Entity("disasterNotification")
export class DisasterNotification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User, (user) => user.disasterNotifications)
    @JoinColumn({ name: "userId" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user!: User; //Can't import User due to circular dependency

    @Column()
    femaDisasterId!: string;

    @ManyToOne(() => FemaDisaster, (femaDisaster) => femaDisaster.disasterNotifications)
    @JoinColumn({ name: "femaDisasterId" })
    femaDisaster!: FemaDisaster;

    @Column({
        type: "enum",
        enum: NotificationType,
    })
    notificationType!: NotificationType;

    @Column({
        type: "enum",
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD,
    })
    notificationStatus?: NotificationStatus;

    @Column({ nullable: true })
    firstSentAt?: Date;

    @Column({ nullable: true })
    lastSentAt?: Date;

    @Column({ nullable: true })
    acknowledgedAt?: Date;
}

