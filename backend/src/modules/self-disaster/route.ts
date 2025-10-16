import { DataSource } from "typeorm";
import { Hono } from "hono";
import { DisasterTransaction } from "../disaster/transaction";
import { DisasterService } from "../disaster/service";
import { DisasterController } from "../disaster/controller";
import { SelfDisasterTransaction } from "./transaction";
import { SelfDisasterService } from "./service";
import { SelfDisasterController } from "./controller";

export const selfDisasterRoutes = (db: DataSource, femaHono: Hono): Hono => {
    const disasterTransaction = new SelfDisasterTransaction(db);
    const disasterService = new SelfDisasterService(disasterTransaction);
    const disasterController = new SelfDisasterController(disasterService);

    femaHono.post("/self", (ctx) => disasterController.createSelfDisaster(ctx));
    femaHono.delete("/self/:id", (ctx) => disasterController.deleteSelfDisaster(ctx));

    return femaHono;
};
