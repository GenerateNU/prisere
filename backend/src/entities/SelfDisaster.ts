import type { Relation } from "typeorm";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Company } from "./Company";

@Entity("self_declared_disaster")
export class SelfDeclaredDisaster {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    companyId!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "companyId" })
    company!: Relation<Company>;

    @Column()
    description!: string;

    @Column({ type: "timestamptz" })
    startDate!: Date;

    //A null end date represents an open end
    @Column({ type: "timestamptz", nullable: true })
    endDate?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
