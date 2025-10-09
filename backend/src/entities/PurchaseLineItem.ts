import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Purchase } from "./Purchase";
import type { Relation } from "typeorm";
import { LINE_ITEM_DESCRIPTION_CHARS } from "../utilities/constants";

export enum PurchaseLineItemType {
    EXTRANEOUS = "extraneous",
    TYPICAL = "typical",
}

@Entity("purchase_line_item")
export class PurchaseLineItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true, length: LINE_ITEM_DESCRIPTION_CHARS })
    description?: string;

    //Required because PurchaseLineItems only occur for ingested Purchases
    @Column()
    quickBooksId!: number;

    @ManyToOne(() => Purchase, (purchase) => purchase.lineItems)
    @JoinColumn({ name: "purchaseId" })
    purchase!: Relation<Purchase>;

    @Column()
    purchaseId!: string;

    @Column()
    amountCents!: number;

    @Column()
    category!: string;

    @Column({ type: "enum", enum: PurchaseLineItemType })
    type!: PurchaseLineItemType;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;
}
