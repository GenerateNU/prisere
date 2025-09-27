import { UUID } from "crypto";
import { Entity, PrimaryGeneratedColumn, Column , ManyToOne, JoinColumn} from "typeorm";
import {User} from './User'
import { FemaDisaster } from './FemaDisaster'
import { EnumDeclaration } from "typescript";

export enum NotificationType {
    WEB = 'web',
    EMAIL = 'email'
}

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read',
    ACKNOWLEDGED = 'acknowledged'
}

@Entity("disasterNotification")
export class DisasterNotification{
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @ManyToOne(() => User, user => user.disasterNotifications)
    @JoinColumn({ name: 'userId' }) // Optional field to speficy the column name
    user!: User;

    @ManyToOne(() => FemaDisaster, femaDisaster => femaDisaster.disasterNotifications)
    @JoinColumn({ name: 'disasterId' })
    femaDisaster!: FemaDisaster

    @Column({
        type: "enum",
        enum: NotificationType
    })
    notificationType!: NotificationType

    @Column({
        type: "enum",
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD
    })
    notifiactionStatus!: NotificationStatus

    @Column()
    firstSentAt!: Date

    @Column()
    lastSentAt!: Date

    @Column()
    acknowledgedAt!: Date
}