import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Claim } from "./Claim.js";
import { LocationAddress } from "./LocationAddress.js";
import type { Relation } from "typeorm";

@Unique(["claimId", "locationAddressId"])
@Entity("claim_location")
export class ClaimLocation {
    // TypeORM requires a primary column
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    claimId!: string;

    @Column()
    locationAddressId!: string;

    @ManyToOne(() => Claim, (claim) => claim.claimLocations, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "claimId" })
    claim?: Relation<Claim>;

    @ManyToOne(() => LocationAddress, (location) => location.claimLocations, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "locationAddressId" })
    locationAddress?: Relation<LocationAddress>;
}
