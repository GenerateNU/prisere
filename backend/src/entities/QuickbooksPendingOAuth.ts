import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import type { User } from "./User";

/**
 * This can be implemented in a Redis instance in the future if desired,
 * for now we are just storing this in a table. (We don't have _that_ many users)
 */
@Entity()
export class QuickbooksPendingOAuth {
    @PrimaryColumn()
    stateId!: string;

    @Column()
    initiatorUserId!: User["id"];

    @ManyToOne("User")
    initiatorUser!: User;

    @Column({ type: "timestamptz", nullable: true })
    consumedAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
