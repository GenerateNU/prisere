import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";

@Entity("document")
export class Document {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    key!: string;

    @Column()
    user!: string;

    @Column({ nullable: true })
    createdAt?: string;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "userId" })
    company?: Relation<User>;
}