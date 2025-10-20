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

        const existingRecord = await repository.findOne({ where: { id: payload.id } });
        const isNew = !existingRecord;

        const result = await repository
            .createQueryBuilder()
            .insert()
            .into(FemaDisaster)
            .values(payload)
            .orUpdate(
                [
                    "disasterNumber",
                    "fipsStateCode",
                    "declarationDate",
                    "incidentBeginDate",
                    "incidentEndDate",
                    "fipsCountyCode",
                    "declarationType",
                    "designatedArea",
                    "designatedIncidentTypes",
                ],
                ["id"]
            )
            .returning("*")
            .execute();

        const disaster = result.generatedMaps[0] as FemaDisaster;
        return { disaster, isNew };
    }
}
