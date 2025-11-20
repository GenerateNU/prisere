import { DataSource } from "typeorm";
import { Hono } from "hono";
import { FemaRiskIndexController } from "./controller";
import { FemaRiskIndexService } from "./service";
import { FemaRiskTransaction } from "./transaction";

export const femaRiskIndexProcessing = (db: DataSource): Hono => {
    const femaRiskIndex = new Hono();

    const transaction = new FemaRiskTransaction(db);
    const service = new FemaRiskIndexService(transaction);
    const controller = new FemaRiskIndexController(service);

    femaRiskIndex.post("/", (ctx) => controller.updateFemaRiskIndexData(ctx));
    femaRiskIndex.get("/", (ctx) => controller.getFemaRiskIndexData(ctx));

    return femaRiskIndex;
};
