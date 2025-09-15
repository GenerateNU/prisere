import { FemaDisaster } from "../../entities/FemaDisaster";
import { CreateDisasterDTO } from "../../types/FemaDisaster";
import { DataSource, InsertResult } from "typeorm";
import { plainToClass } from 'class-transformer';


export interface IDisasterTransaction {
    /**
     * Adds a new FemaDisaster to the database
     * @param payload FemaDisaster to be inserted into Database
     * @returns Promise resolving to inserted FemaDisaster or null if failed
     */
    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster| null>;
}

export class DisasterTransaction implements IDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster | null>{
        const disaster:FemaDisaster = plainToClass(FemaDisaster, payload);
        const result:InsertResult = await this.db.createQueryBuilder()
            .insert()
            .into(FemaDisaster)
            .values(disaster)
            .returning("*")
            .execute();
        return result.raw[0] ?? null;
    }

}