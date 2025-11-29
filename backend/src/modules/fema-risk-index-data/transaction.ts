import { DataSource } from "typeorm";
import { CountyFemaRisk } from "../../entities/CountyFemaRiskData";
import { FemaRiskIndexDataResult, InsertFemaRiskIndexDataInput } from "./types";

export interface IFemaRiskIndexTransaction {
    insertFemaRiskIndexData(payload: InsertFemaRiskIndexDataInput): Promise<void>;
    dropFemaRiskIndexData(): Promise<void>;
    fetchFemaIndexData(): Promise<FemaRiskIndexDataResult>;
}

export class FemaRiskTransaction implements IFemaRiskIndexTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async fetchFemaIndexData(): Promise<FemaRiskIndexDataResult> {
        return (await this.db.manager.find(CountyFemaRisk, {})).map((countyData) => ({
            ...countyData,
            updatedAt: new Date(countyData.updatedAt).toISOString(),
            createdAt: new Date(countyData.createdAt).toISOString(),
        }));
    }

    async dropFemaRiskIndexData(): Promise<void> {
        await this.db.manager.deleteAll(CountyFemaRisk);
    }

    async insertFemaRiskIndexData(payload: InsertFemaRiskIndexDataInput): Promise<void> {
        await this.db.manager.insert(CountyFemaRisk, payload);
    }
}
