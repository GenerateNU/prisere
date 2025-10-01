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
        const result:FemaDisaster = await this.db.getRepository(FemaDisaster).save(disaster);
        return result;
    }

    async getAllDisasters() {
        const result = await this.db.getRepository(FemaDisaster).find();
        return result;
    }
}
