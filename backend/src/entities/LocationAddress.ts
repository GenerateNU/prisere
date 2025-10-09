import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "./Company.js";

//Represents an address for a location of a company
@Entity("location_address")
export class LocationAddress {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    country!: string;

    @Column()
    stateProvince!: string;

    @Column()
    city!: string;

    @Column()
    streetAddress!: string;

    @Column()
    postalCode!: string;

    @Column({ nullable: true })
    county?: string;

    @Column()
    companyId!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "companyId" })
    company!: Company;

    // Only adding as nullable in case of a (FEMA API) error in loction translating
    @Column({nullable: true})
    fipsStateCode!: number;

    @Column({nullable: true})
    fipsCountyCode!: number;
}
