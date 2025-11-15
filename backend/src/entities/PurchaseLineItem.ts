import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from "typeorm";
import { Purchase } from "./Purchase";
import type { Relation } from "typeorm";
import { LINE_ITEM_CATEGORY_CHARS, LINE_ITEM_DESCRIPTION_CHARS } from "../utilities/constants";

export enum PurchaseLineItemType {
    EXTRANEOUS = "extraneous",
    TYPICAL = "typical",
    PENDING = "pending",
    SUG_EX = "suggested extraneous",
    SUG_TY = "suggested typical",
}

@Entity("purchase_line_item")
@Unique(["purchaseId", "quickBooksId"])
export class PurchaseLineItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true, length: LINE_ITEM_DESCRIPTION_CHARS })
    description?: string;

    @Column({ nullable: true })
    quickBooksId?: number;

    @ManyToOne(() => Purchase, (purchase) => purchase.lineItems)
    @JoinColumn({ name: "purchaseId" })
    purchase?: Relation<Purchase>;

    @Column()
    purchaseId!: string;

    @Column()
    amountCents!: number;

    @Column({ nullable: true, length: LINE_ITEM_CATEGORY_CHARS })
    category?: string | null;

    @Column({ type: "enum", enum: PurchaseLineItemType })
    type!: PurchaseLineItemType;

    @CreateDateColumn()
    dateCreated!: Date;

    @UpdateDateColumn()
    lastUpdated!: Date;

    @Column({ type: "timestamptz", nullable: true })
    quickbooksDateCreated?: Date | null;
}
