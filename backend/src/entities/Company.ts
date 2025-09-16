import { Entity, PrimaryGeneratedColumn, Column} from "typeorm"

@Entity()
export class Company {
    @PrimaryGeneratedColumn("uuid")
      id!: string;

    @Column()
      name!: string;

    @Column({type: 'timestamptz', nullable: true})
      lastQuickBooksImportTime?: Date;
}