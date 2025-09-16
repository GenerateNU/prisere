import { FemaDisaster } from "../../entities/FemaDisaster";
import { CreateDisasterDTO } from "../../types/FemaDisaster";
import { DataSource } from "typeorm";
import { plainToClass } from 'class-transformer';


export interface IDisasterTransaction {
    /**
     * Adds a new FemaDisaster to the database
     * @param payload FemaDisaster to be inserted into Database
     * @returns Promise resolving to inserted FemaDisaster or null if failed
     */
    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster>;

    getAllDisasters(): Promise<FemaDisaster[]>;
}

export class DisasterTransaction implements IDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createDisaster(payload: CreateDisasterDTO) {
        console.log(payload);
        const disaster = plainToClass(FemaDisaster, payload);
        console.log(disaster);

        const result = await this.db.createQueryBuilder()
            .insert()
            .into(FemaDisaster)
            .values(disaster)
            .returning("*")
            .execute();


        return result.raw[0] as FemaDisaster;
    }

    async getAllDisasters() {
        const result = await this.db.createQueryBuilder()
            .select("fema_disaster")
            .from(FemaDisaster, "fema_disaster")
            .getMany();

        console.log(result.length);

        return result;
    }
}