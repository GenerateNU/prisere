import typeorm, { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { Company } from "./Company";
import { DisasterNotification } from "./DisasterNotification";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true })
    email?: string;

    @ManyToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: typeorm.Relation<Company>;

    @Column({ nullable: true })
    companyId?: string;

    @OneToMany(() => DisasterNotification, (disasterNotification) => disasterNotification.user)
    disasterNotifications!: typeorm.Relation<DisasterNotification[]>;

}