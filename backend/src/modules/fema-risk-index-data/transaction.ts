import { DataSource } from "typeorm";
import { CountyFemaRisk } from "../../entities/CountyFemaRiskData";
import { InsertFemaRiskIndexDataInput } from "./types";

export interface IFemaRiskIndexTransaction {
    insertFemaRiskIndexData(payload: InsertFemaRiskIndexDataInput): Promise<void>;
    dropFemaRiskIndexData(): Promise<void>;
    fetchFemaIndexData(): Promise<InsertFemaRiskIndexDataInput>;
}

export class FemaRiskTransaction implements IFemaRiskIndexTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async fetchFemaIndexData(): Promise<InsertFemaRiskIndexDataInput> {
        return await this.db.manager.find(CountyFemaRisk, {});
    }

    async dropFemaRiskIndexData(): Promise<void> {
        await this.db.manager.deleteAll(CountyFemaRisk);
    }

    async insertFemaRiskIndexData(payload: InsertFemaRiskIndexDataInput): Promise<void> {
        await this.db.manager.insert(CountyFemaRisk, payload);
    }
}
