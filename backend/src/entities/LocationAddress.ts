import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Company } from "./Company.js";
import { DisasterNotification } from "./DisasterNotification.js";
import { ClaimLocation } from "./ClaimLocation.js";

//Represents an address for a location of a company
@Entity("location_address")
export class LocationAddress {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    alias!: string;

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
    company?: Company;

    @Column()
    fipsStateCode!: number;

    @Column()
    fipsCountyCode!: number;

    @OneToMany(() => DisasterNotification, (notification: { locationAddress: any }) => notification.locationAddress)
    disasterNotifications?: DisasterNotification[];

    @OneToMany(() => ClaimLocation, (claimLocation) => claimLocation.locationAddress)
    claimLocations?: ClaimLocation[];
}
