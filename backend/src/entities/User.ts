import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
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

    @OneToOne("Company", (company: Company) => company.user, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;

    @Column({ nullable: true })
    companyId?: string;
}
