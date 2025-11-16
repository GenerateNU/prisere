import { Hono } from "hono";
import { DataSource } from "typeorm";
import { SelfDisasterController } from "./controller";
import { SelfDisasterService } from "./service";
import { SelfDisasterTransaction } from "./transaction";

export const selfDisasterRoutes = (db: DataSource, femaHono: Hono): Hono => {
    const disasterTransaction = new SelfDisasterTransaction(db);
    const disasterService = new SelfDisasterService(disasterTransaction);
    const disasterController = new SelfDisasterController(disasterService);

    femaHono.post("/self", (ctx) => disasterController.createSelfDisaster(ctx));
    femaHono.patch("/self/:id", (ctx) => disasterController.updateSelfDisaster(ctx));
    femaHono.delete("/self/:id", (ctx) => disasterController.deleteSelfDisaster(ctx));

    return femaHono;
};
