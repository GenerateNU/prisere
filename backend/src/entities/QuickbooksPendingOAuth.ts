import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import type { User } from "./User";

/**
 * This can be implemented in a Redis instance in the future if desired,
 * for now we are just storing this in a table. (We don't have _that_ many users)
 */
@Entity()
export class QuickbooksPendingOAuth {
    /**
     * Token generated on creation of a QuickBooks OAuth flow. It ensures
     * that arbitrary sessions cannot be created externally and must follow a
     * request from our backend to start one
     */
    @PrimaryColumn()
    stateId!: string;

    @Column()
    initiatorUserId!: User["id"];

    @ManyToOne("User")
    @JoinColumn({ name: "initiatorUserId" })
    initiatorUser!: User;

    /**
     * When a pending OAuth is "consumed" it means the OAuth request used this state
     * resulted in either a connected QB account or was rejected by the user
     */
    @Column({ type: "timestamptz", nullable: true })
    consumedAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
