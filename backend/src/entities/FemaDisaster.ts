import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { DisasterNotification } from "./DisasterNotification.js";

@Entity()
export class FemaDisaster {
    @PrimaryColumn()
    id!: string;

    @Column()
    disasterNumber!: number;

    @Column()
    fipsStateCode!: number;

    @Column({ type: "timestamp" })
    declarationDate!: Date;

    @Column({ nullable: true, type: "timestamp" })
    incidentBeginDate?: Date | null;

    @Column({ nullable: true, type: "timestamp" })
    incidentEndDate?: Date | null;

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
