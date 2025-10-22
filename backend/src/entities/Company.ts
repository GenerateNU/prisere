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

@Entity("company")
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    businessOwnerFullName!: string;

    @Column({ type: "timestamptz", nullable: true })
    lastQuickBooksImportTime?: Date;

    @OneToMany("CompanyExternal", (external: CompanyExternal) => external.company)
    externals!: CompanyExternal[];

    @OneToOne("User", (user: User) => user.company)
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
