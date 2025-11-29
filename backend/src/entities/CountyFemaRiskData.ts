import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";

@Entity("county_fema_risk_data")
export class CountyFemaRisk {
    //Column title STCOFIPS
    @PrimaryColumn({ length: 5, unique: true })
    countyFipsCode!: string;

    //Column title RISK_RATNG
    @Column({ length: 20 })
    riskRating!: string;

    //EAL_RATING
    @Column({ length: 20 })
    ealRating!: string;

    //Column title SOVI_RATNG
    @Column({ length: 20 })
    socialVuln!: string;

    //Column title RESL_RATNG
    @Column({ length: 20 })
    communityResilience!: string;

    //Column title CFLD_RISKR
    @Column({ length: 20 })
    coastalFlooding!: string;

    //Column title DRGT_RISKR
    @Column({ length: 20 })
    drought!: string;

    //Column title WFIR_RISKR
    @Column({ length: 20 })
    wildFire!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
