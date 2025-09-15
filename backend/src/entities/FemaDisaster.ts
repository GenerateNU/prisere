import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class FemaDisaster {

    @PrimaryColumn()
    id!: string;
    // unique id assigned to the record, uuid, vs. disaster number, which one is more useful for
    // filling insurance?

    @Column()
    disaster_number!: number;

    @Column()
    state!: number; // why not use the FIPS State code like for county instead of state name?

    @Column({ type: 'date' })
    declaration_date!: Date;

    @Column({ nullable: true, type: 'date' })
    start_date?: Date;


    @Column({ nullable: true, type: 'date' })
        end_date?: Date;


    @Column()
    fips_county_codes!: number;


    // possible additions

    @Column()
    declaration_type!: string;

    @Column()
    designated_area!: string; // description for business owners to know where exactly disater happened,
    // counties are big

    @Column()
    designated_incident_types!: string; // for business owners to identify if the disaster has anything to do
    // with the expenses they want to reinburse

}
