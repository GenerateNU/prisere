import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";
import type { Relation } from "typeorm";
import { Company } from "./Company.js";

@Entity("purchase")
@Unique(["companyId", "quickBooksId"])
export class Purchase {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @Column()
    companyId!: string;

    //QuickBooks's internal ID for the purchase that was made
    @Column({ nullable: true })
    quickBooksId?: number;

    //Represented in cents to prevent precision issues
    @Column()
    totalAmountCents!: number;

    @Column()
    isRefund!: boolean;

    @Column({ type: "timestamptz", nullable: true })
    quickbooksDateCreated?: Date;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;
}
