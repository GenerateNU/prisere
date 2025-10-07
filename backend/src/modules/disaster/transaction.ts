import { FemaDisaster } from "../../entities/FemaDisaster";
import { DataSource } from "typeorm";
import { CreateDisasterDTO } from "../../types/disaster";

export interface IDisasterTransaction {
    createDisaster(payload: CreateDisasterDTO): Promise<FemaDisaster>;
    getAllDisasters(): Promise<FemaDisaster[]>;
    upsertDisaster(payload: CreateDisasterDTO): Promise<{ disaster: FemaDisaster; isNew: boolean }>;
}

export class DisasterTransaction implements IDisasterTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createDisaster(payload: CreateDisasterDTO) {
        const disaster = payload;
        const result: FemaDisaster = await this.db.getRepository(FemaDisaster).save(disaster);
        return result;
    }

    async getAllDisasters() {
        const result = await this.db.getRepository(FemaDisaster).find();
        return result;
    }

    async upsertDisaster(payload: CreateDisasterDTO): Promise<{ disaster: FemaDisaster; isNew: boolean }> {
        const repository = this.db.getRepository(FemaDisaster);
        
        // Check if disaster exists, update if so, create if not
        const existing = await repository.findOne({
            where: { disasterNumber: payload.disasterNumber }
        });
        
        if (existing) {
            await repository.update({ id: existing.id }, payload);
            const updated = await repository.findOne({ where: { id: existing.id } });
            return { disaster: updated!, isNew: false };
        } else {
            const created = await repository.save(payload);
            return { disaster: created, isNew: true };
        }
    }
}
