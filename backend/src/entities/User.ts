import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Company } from "./Company";

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
    company?: Company;

    @Column({ nullable: true })
    companyId?: string;
}
