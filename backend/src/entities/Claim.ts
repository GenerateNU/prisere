import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import type { Relation } from "typeorm";
import { Company } from "./Company.js";
import { FemaDisaster } from "./FemaDisaster.js";
import { ClaimStatusType } from "../types/ClaimStatusType.js";
import { ClaimLocation } from "./ClaimLocation.js";
import { SelfDeclaredDisaster } from "./SelfDisaster.js";

@Unique(["companyId", "femaDisasterId", "selfDisasterId"])
@Entity("claim")
export class Claim {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: ClaimStatusType,
    })
    status!: ClaimStatusType;

    @Column()
    companyId!: string;

    @ManyToOne(() => Company, (company) => company.id)
    @JoinColumn({ name: "companyId" })
    company?: Relation<Company>;

    @Column({ nullable: true })
    femaDisasterId?: string;

    @ManyToOne(() => FemaDisaster, (disaster) => disaster.id)
    @JoinColumn({ name: "femaDisasterId" })
    femaDisaster?: Relation<FemaDisaster>;

    @Column({ nullable: true })
    selfDisasterId?: string;

    @ManyToOne(() => SelfDeclaredDisaster, (disaster) => disaster.id)
    @JoinColumn({ name: "selfDisasterId" })
    selfDisaster?: Relation<SelfDeclaredDisaster>;

    @OneToMany(() => ClaimLocation, (claimLocation) => claimLocation.claim)
    claimLocations?: Relation<ClaimLocation>[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
