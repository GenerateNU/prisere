import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { FemaDisaster } from "./FemaDisaster.js";
import { NotificationType, NotificationStatus } from "../types/NotificationEnums.js";
import { User } from "./User.js";
import type { Relation } from "typeorm";
import { LocationAddress } from "./LocationAddress.js";

@Entity("disasterNotification")
export class DisasterNotification {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "userId" })
    user!: Relation<User>;

    @Column()
    femaDisasterId!: string;

    @ManyToOne(() => FemaDisaster)
    @JoinColumn({ name: "femaDisasterId" })
    femaDisaster!: Relation<FemaDisaster>;

    @Column({default: true})
    isWeb!: boolean;

    @Column({default: true})
    isEmail!: boolean

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
    readAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ nullable: true })
    locationAddressId?: string;

    @ManyToOne(() => LocationAddress, { nullable: true })
    @JoinColumn({ name: "locationAddressId" })
    locationAddress?: LocationAddress;
}
