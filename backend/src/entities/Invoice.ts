import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Unique, CreateDateColumn } from "typeorm";
import { Company } from "./Company.js";

@Unique(["quickbooksId", "companyId"])
@Entity("invoice")
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @Column()
    companyId!: string;

    //QuickBooks's internal ID for the invoice that was made
    @Column({ nullable: true })
    quickbooksId!: number;

    //Represented in cents to prevent precision issues
    @Column()
    totalAmountCents!: number;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;

    @Column({ nullable: true })
    quickbooksDateCreated?: Date;
}
