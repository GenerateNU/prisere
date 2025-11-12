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

    @Column({ length: 200 })
    policyName!: string;

    @Column({ length: 100 })
    policyHolderFirstName!: string;

    @Column({ length: 100 })
    policyHolderLastName!: string;

    @Column({ length: 200 })
    insuranceCompanyName!: string;

    @Column({ length: 100 })
    policyNumber!: string;

    @Column({ length: 100 })
    insuranceType!: string;

    @Column({ select: false })
    companyId!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}
