import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";
import { Company } from "./Company.js";

@Unique(['quickbooksId', 'companyId'])
@Entity("invoice")
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @Column()
    companyId!: string;

    //QuickBooks's internal ID for the purchase that was made
    @Column()
    quickbooksId!: number;

    //Represented in cents to prevent precision issues
    @Column()
    totalAmountCents!: number;

    @Column()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;
}