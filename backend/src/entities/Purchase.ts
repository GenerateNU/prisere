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

@Entity("purchase")
export class Purchase {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @Column()
    companyId!: string;

    //QuickBooks's internal ID for the purchase that was made
    @Column()
    quickBooksId!: number;

    //Represented in cents to prevent precision issues
    @Column()
    totalAmountCents!: number;

    @Column({ default: false })
    isRefund!: boolean;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;
}
