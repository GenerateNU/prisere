import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Relation,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Company } from "./Company.js";

@Entity("quick_books_purchase")
export class QuickBooksPurchase {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @Column()
    companyId!: string;

    //QuickBooks's internal ID for the purchase that was made
    @Column()
    quickbooksId!: number;

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
