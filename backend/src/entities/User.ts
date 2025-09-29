import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Company } from "./Company.js";
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

    @OneToMany("disasterNotification", "user", { nullable: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disasterNotifications!: any[];

    @OneToOne("disasterNotification", "user", { cascade: true }) // cascase true will automatically save user preferences when saving user
    userPreferences!: UserPreferences;
}
