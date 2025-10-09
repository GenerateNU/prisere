import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    Unique,
    CreateDateColumn,
} from "typeorm";
import { Invoice } from "./Invoice.js";
import { LINE_ITEM_DESCRIPTION_CHARS, LINE_ITEM_CATEGORY_CHARS } from "../utilities/constants.js";

@Unique(["quickbooksId", "invoiceId"])
@Entity("invoice_line_item")
export class InvoiceLineItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true, length: LINE_ITEM_DESCRIPTION_CHARS })
    description?: string;

    @ManyToOne(() => Invoice, { nullable: true })
    @JoinColumn({ name: "invoiceId" })
    invoice!: Invoice;

    @Column()
    invoiceId!: string;

    //QuickBooks's internal ID for the invoice line item that was made
    @Column({ nullable: true })
    quickbooksId!: number;

    //Represented in cents to prevent precision issues
    @Column()
    amountCents!: number;

    @Column({ nullable: true, length: LINE_ITEM_CATEGORY_CHARS })
    category?: string;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;

    @Column({ nullable: true })
    quickbooksDateCreated?: Date;
}
