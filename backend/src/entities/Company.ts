import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import type { CompanyExternal } from "./CompanyExternals";
import type { User } from "./User";

@Entity("company")
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ type: "timestamptz", nullable: true })
    lastQuickBooksImportTime?: Date;

    @OneToMany("CompanyExternal", (external: CompanyExternal) => external.company)
    externals!: CompanyExternal[];

    @OneToMany("User", (user: User) => user.company)
    users!: User[];
}
