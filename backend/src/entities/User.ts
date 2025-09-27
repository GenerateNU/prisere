import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Company } from "./Company.js";
import { DisasterNotification } from "./DisasterNotification.js";
import { UserPreferences } from "./UserPrefrences.js";

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

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;

    @Column({ nullable: true })
    companyId?: string;

    @OneToMany(() => DisasterNotification, (disasterNotification: { user: User; }) => disasterNotification.user, { nullable: true })
    disasterNotifications!: DisasterNotification[];

    @OneToOne(() => UserPreferences, (userPreferences: { user: User; }) => userPreferences.user, { cascade: true }) // cascase true will automatically save user preferences when saving user
    userPreferences!: UserPreferences
}
