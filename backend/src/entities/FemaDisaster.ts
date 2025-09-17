import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class FemaDisaster {
    @PrimaryColumn()
    femaId!: string;

    @Column()
    disasterNumber!: number;

    @Column()
    state!: number; // why not use the FIPS State code like for county instead of state name?

    @Column({ type: "timestamp" })
    declarationDate!: Date;

    @Column({ nullable: true, type: "timestamp" })
    startDate?: Date;

    @Column({ nullable: true, type: "timestamp" })
    endDate?: Date;

    @Column()
    fipsCountyCode!: number;

    // possible additions

    @Column()
    declarationType!: string;

    @Column()
    designatedArea!: string; // description for business owners to know where exactly disater happened,
    // counties are big

    @Column()
    designatedIncidentTypes!: string; // for business owners to identify if the disaster has anything to do
    // with the expenses they want to reinburse
}
