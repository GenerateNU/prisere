import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { Claim } from "./Claim";

@Entity("document")
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    key!: string;

    @Column()
    downloadUrl!: string;

    @Column()
    s3DocumentId!: string;

    @Column({ nullable: true })
    category?: string;

    @Column({ nullable: true })
    createdAt?: Date;

    @Column({ nullable: true })
    lastModified?: Date | null;

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

    @Column({ name: "claimId", nullable: true})
    claimId?: string;

    @OneToOne(() => Claim)
    @JoinColumn({ name: "claimId" })
    claim?: Relation<Claim>;
}