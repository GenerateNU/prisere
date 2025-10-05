import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { Claim } from "./Claim.js";
import { LocationAddress } from "./LocationAddress.js";

@Unique(["claim", "location"])
@Entity("claim_location")
export class ClaimLocation {

    @Column()
    claimId!: string;

    @Column()
    locationAddressId!: string;

    @ManyToOne(() => Claim, claim => claim.claimLocations, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    claim!: Claim;

    @ManyToOne(() => LocationAddress, location => location.claimLocations, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    locationAddress!: LocationAddress;
}
