import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import type { Company } from "./Company";

@Entity()
export class QuickbooksSession {
    @PrimaryColumn()
    accessToken!: string;

    @Column()
    refreshToken!: string;

    @Column({ type: "timestamptz" })
    accessExpiryTimestamp!: Date;

    @Column({ type: "timestamptz" })
    refreshExpiryTimestamp!: Date;

    @Column()
    companyId!: string;

    @OneToOne("Company", { onUpdate: "CASCADE", onDelete: "CASCADE", nullable: false })
    @JoinColumn()
    company!: Company;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
