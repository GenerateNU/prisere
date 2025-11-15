import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from "typeorm";
import type { CompanyExternal } from "./CompanyExternals";
import type { User } from "./User";

export enum CompanyTypesEnum {
    LLC = "LLC",
    SOLE = "Sole Proprietorship",
    CORP = "Corporation",
    PART = "Partnership",
}


@Entity("company")
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ length: 200 })
    businessOwnerFullName!: string;

    @Column({ type: "timestamptz", nullable: true })
    lastQuickBooksInvoiceImportTime?: Date;

    @Column({ type: "timestamptz", nullable: true })
    lastQuickBooksPurchaseImportTime?: Date;

    @OneToMany("CompanyExternal", (external: CompanyExternal) => external.company)
    externals!: CompanyExternal[];

    @OneToOne("User", (user: User) => user.company)
    user!: User;

    @Column({
        type: "enum",
        enum: CompanyTypesEnum,
    })
    companyType!: CompanyTypesEnum;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
