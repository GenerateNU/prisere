import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Company } from "./Company.js";
import { FemaDisaster } from "./FemaDisaster.js";
import { ClaimStatusType } from "../types/ClaimStatusType.js";
import { ClaimLocation } from "./ClaimLocation.js";

@Unique(["companyId", "disasterId"])
@Entity("claim")
export class Claim {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: ClaimStatusType,
    })
    status!: ClaimStatusType;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
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

    @OneToMany(() => ClaimLocation, claimLocation => claimLocation.claim)
    claimLocations?: ClaimLocation[];

}
