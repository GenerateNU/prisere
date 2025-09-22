import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Company } from "./Company.js";

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
    company?: Relation<Company>;

    @Column({ nullable: true })
    companyId?: string;
}
