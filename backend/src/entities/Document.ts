import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { Claim } from "./Claim";
import { DocumentCategories } from "../types/DocumentType";

@Entity("document")
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    key!: string;

    @Column()
    s3DocumentId!: string;

    @Column({
        type: "enum",
        enum: DocumentCategories,
        nullable: true,
    })
    category?: DocumentCategories;

    @Column({ nullable: true })
    createdAt?: string;

    @Column({ nullable: true })
    lastModified?: string;

    @Column({ name: "userId", nullable: true })
    userId?: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user?: Relation<User>;

    @Column({ name: "companyId" })
    companyId!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @ManyToMany(() => Claim, (claim) => claim.documents)
    // The claims this document is associated with as "additional info"
    claims?: Relation<Claim>[];

    @Column({ name: "exportedClaimID", nullable: true })
    // The claim ID this document was exported from (if this is an export)
    exportedClaimID?: string;

    @ManyToOne(() => Claim, (claim) => claim.exportedDocuments)
    @JoinColumn({ name: "exportedClaimID" })
    // The claim this document is an export of
    exportedClaim?: Relation<Claim>;
}
