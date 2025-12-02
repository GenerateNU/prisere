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
    Check,
    JoinTable,
    ManyToMany,
} from "typeorm";
import type { Relation } from "typeorm";
import { Company } from "./Company.js";
import { FemaDisaster } from "./FemaDisaster.js";
import { ClaimStatusType } from "../types/ClaimStatusType.js";
import { ClaimLocation } from "./ClaimLocation.js";
import { SelfDeclaredDisaster } from "./SelfDisaster.js";
import { PurchaseLineItem } from "./PurchaseLineItem.js";
import { InsurancePolicy } from "./InsurancePolicy.js";
import { Document } from "./Document.js";

@Unique(["companyId", "femaDisasterId", "selfDisasterId"])
@Check(
    `("femaDisasterId" IS NOT NULL AND "selfDisasterId" IS NULL) OR ("femaDisasterId" IS NULL AND "selfDisasterId" IS NOT NULL)`
)
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

    @ManyToMany(() => PurchaseLineItem)
    @JoinTable({
        name: "claim_purchase_line_items",
        joinColumn: { name: "claimId" },
        inverseJoinColumn: { name: "purchaseLineItemId" },
    })
    purchaseLineItems!: PurchaseLineItem[];

    @Column({ nullable: true })
    insurancePolicyId?: string;

    @ManyToOne(() => InsurancePolicy, (ip) => ip.id)
    @JoinColumn({ name: "insurancePolicyId" })
    insurancePolicy!: InsurancePolicy;

    @ManyToMany(() => PurchaseLineItem)
    @JoinTable({
        name: "claim_uploaded_documents",
        joinColumn: { name: "claimId" },
        inverseJoinColumn: { name: "documentId" },
    })
    documents!: Document[];
}
