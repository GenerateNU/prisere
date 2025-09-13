import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

//All fields of this entity are required since it is trivial to enrich any data that we get from the user.
//From a street address and a city (which are already required field) we can derive all other fields with a
//simple API call.
//https://developers.google.com/maps/documentation/geocoding/overview

//Represents an address for a location of a company
@Entity("location_address")
export class LocationAddress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  country!: string;

  @Column({ nullable: true })
  stateProvince!: string;

  @Column()
  city!: string;

  @Column()
  streetAddress!: string;

  @Column()
  postalCode!: number;

  @Column({ nullable: true })
  county!: string;
}
