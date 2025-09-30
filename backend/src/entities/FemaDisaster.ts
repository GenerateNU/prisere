import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { DisasterNotification } from "./DisasterNotification";

@Entity("fema_disaster")
export class FemaDisaster {
    @PrimaryColumn()
    femaId!: string;

    @Column()
    disasterNumber!: number;

    @Column()
    state!: number;

    @Column({ type: "timestamp" })
    declarationDate!: Date;

    @Column({ nullable: true, type: "timestamp" })
    startDate?: Date;

    @Column({ nullable: true, type: "timestamp" })
    endDate?: Date;

    @Column()
    fipsCountyCode!: number;

    @Column()
    declarationType!: string;

    @Column()
    designatedArea!: string;

    @Column()
    designatedIncidentTypes!: string;

    @OneToMany(() => DisasterNotification, (notification) => notification.femaDisaster, { nullable: true })
    disasterNotifications!: DisasterNotification[];
}
