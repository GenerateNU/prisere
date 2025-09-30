import typeorm, { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FemaDisaster } from "./FemaDisaster";
import type { Relation } from "typeorm";
// import { User } from "./User";
import { NotificationType, NotificationStatus } from "../types/NotificationEnums";
import { User } from "./User";

@Entity("disasterNotification")
export class DisasterNotification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User, {nullable: false})
    @JoinColumn({ name: "userId" })
    user!: typeorm.Relation<User>;

    @Column()
    femaDisasterId!: string;

    @ManyToOne(() => FemaDisaster)
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

