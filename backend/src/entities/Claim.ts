import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "./Company.js";
import { FemaDisaster } from "./FemaDisaster.js";

@Entity("claim")
export class Claim {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    status!: string;

    @Column({ type: "timestamptz" })
    createdAt!: Date;

    @Column({ type: "timestamptz", nullable: true })
    updatedAt?: Date;

    @Column()
    companyId!: string;

    @Column()
    disasterId!: string;

    @ManyToOne(() => Company, (company) => company.id)
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @ManyToOne(() => FemaDisaster, (disaster) => disaster.id)
    @JoinColumn({ name: "disasterId" })
    disaster!: FemaDisaster;
}