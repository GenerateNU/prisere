import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import type { Company } from "./Company";
import { DisasterNotification } from "./DisasterNotification";
import type { Relation } from "typeorm";

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

    @ManyToOne("Company", (company: Company) => company.users, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Relation<Company>;

    @Column({ nullable: true })
    companyId?: string;

    @OneToMany(() => DisasterNotification, (disasterNotification) => disasterNotification.user)
    disasterNotifications!: Relation<DisasterNotification[]>;
}
