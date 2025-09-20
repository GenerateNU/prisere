import { FemaDisaster } from "../../entities/FemaDisaster";
import { DataSource } from "typeorm";
import { CreateDisasterDTO } from "../../types/disaster";

export interface IDisasterTransaction {

    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster>;

    getAllDisasters(): Promise<FemaDisaster[]>;
}

export class DisasterTransaction implements IDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createDisaster(payload: CreateDisasterDTO) {
        const disaster = payload;
        const result = await this.db
            .createQueryBuilder()
            .insert()
            .into(FemaDisaster)
            .values(disaster)
            .returning("*")
            .execute();

        return result.raw[0] as FemaDisaster;
    }

    async getAllDisasters() {
        const result = await this.db
            .createQueryBuilder()
            .select("fema_disaster")
            .from(FemaDisaster, "fema_disaster")
            .getMany();

        return result;
    }
}
