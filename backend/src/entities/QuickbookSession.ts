import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import type { Company } from "./Company";

@Entity()
export class QuickbooksSession {
    /**
     * Used to authenticate requests to QB
     */
    @PrimaryColumn()
    accessToken!: string;

    /**
     * Used to get new access tokens after they are expired
     */
    @Column()
    refreshToken!: string;

    /**
     * Time of expiry for the generated access token
     *
     * Typically will be 1 hour after generation
     */
    @Column({ type: "timestamptz" })
    accessExpiryTimestamp!: Date;

    /**
     * Time of expiry for the generated refresh token.
     * This is used to get new access tokens once they expire
     *
     * This refresh token expires at 100 days.
     */
    @Column({ type: "timestamptz" })
    refreshExpiryTimestamp!: Date;

    @Column()
    companyId!: string;

    @OneToOne("Company", { onUpdate: "CASCADE", onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "companyId" })
    company!: Company;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
