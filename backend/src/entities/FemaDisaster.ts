import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";

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

    @OneToMany("disasterNotification", "fema_disaster", { nullable: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    disasterNotifications!: any[];
}
