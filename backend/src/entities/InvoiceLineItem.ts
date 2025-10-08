import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Unique } from "typeorm";
import { Invoice } from "./Invoice.js";

export const INVOICE_LINE_ITEM_DESCRIPTION_CHARS = 250;
export const INVOICE_LINE_ITEM_CATEGORY_CHARS = 100;

@Unique(["quickbooksId", "invoiceId"])
@Entity("invoice_line_item")
export class InvoiceLineItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true, length: INVOICE_LINE_ITEM_DESCRIPTION_CHARS })
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

    @Column({ nullable: true, length: INVOICE_LINE_ITEM_CATEGORY_CHARS })
    category?: string;

    @Column()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;
}
