import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, Index } from "typeorm";
import type { Company } from "./Company";

export const COMPANY_EXTERNAL_SOURCES = ["quickbooks"] as const;
export type CompanyExternalSource = (typeof COMPANY_EXTERNAL_SOURCES)[number];

@Entity()
@Index(["source", "externalId"], { unique: true })
export class CompanyExternal {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: COMPANY_EXTERNAL_SOURCES })
    source!: CompanyExternalSource;

    @Column()
    externalId!: string;

    @Column()
    companyId!: string;

    @ManyToOne("Company", (company: Company) => company.externals)
    company!: Company;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
