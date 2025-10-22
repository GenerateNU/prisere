import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Company } from "./Company.js";

@Entity("insurance_policy")
export class InsurancePolicy {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    policyHolderFirstName!: string;

    @Column()
    policyHolderLastName!: string;

    @Column()
    insuranceCompanyName!: string;

    @Column()
    policyNumber!: string;

    @Column()
    insuranceType!: string;

    @Column()
    companyId!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
