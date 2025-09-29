import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

export enum NotificationType {
    WEB = "web",
    EMAIL = "email",
}

export enum NotificationStatus {
    UNREAD = "unread",
    READ = "read",
    ACKNOWLEDGED = "acknowledged",
}

@Entity("disasterNotification")
export class DisasterNotification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne("user", "disasterNotification")
    @JoinColumn({ name: "userId" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user!: any; //Can't import User due to circular dependency

    @Column()
    femaDisasterId!: string;

    @ManyToOne("fema_disaster", "disasterNotifications")
    @JoinColumn({ name: "femaDisasterId" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    femaDisaster!: any;

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
