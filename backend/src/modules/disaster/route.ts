import { DataSource } from "typeorm";
import { Hono } from "hono";
import { DisasterTransaction } from "../disaster/transaction";
import { DisasterService } from "../disaster/service";
import { DisasterController } from "../disaster/controller";
import { selfDisasterRoutes } from "../self-disaster/route";

export const disasterRoutes = (db: DataSource): Hono => {
    const hono = new Hono();

    selfDisasterRoutes(db, hono);

    const disasterTransaction = new DisasterTransaction(db);
    const disasterService = new DisasterService(disasterTransaction);
    const disasterController = new DisasterController(disasterService);

    hono.post("/", (ctx) => disasterController.createDisaster(ctx));

    hono.get("/", (ctx) => disasterController.getAllDisasters(ctx));

    return hono;
};
