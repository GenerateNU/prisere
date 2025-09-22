import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import type { Company } from "./Company";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    companyId?: string;

    @ManyToOne("Company", (company: Company) => company.users, { nullable: true })
    company?: Company;
}
