import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Company } from "./Company.js";
import { DisasterNotification } from "./DisasterNotification";
import type { Relation } from "typeorm";
import { UserPreferences } from "./UserPreferences";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true })
    email?: string;

    @OneToOne("Company", (company: Company) => company.user, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Relation<Company>;

    @Column({ nullable: true })
    companyId?: string;

    @OneToMany(() => DisasterNotification, (notifications) => notifications.user)
    disasterNotifications!: Relation<DisasterNotification[]>;

    @OneToOne(() => UserPreferences, (pref) => pref.user)
    preferences!: Relation<UserPreferences>;
}
