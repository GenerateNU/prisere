import {DataSource} from "typeorm";
import {Hono} from "hono";
import {IDisasterTransaction, DisasterTransaction} from "../disaster/transaction";
import {IDisasterService, DisasterService} from "../disaster/service";
import {IDisasterController, DisasterController} from "../disaster/controller";


export const disasterRoutes = (db: DataSource): Hono => {
    const hono = new Hono();

    const disasterTransaction: IDisasterTransaction = new DisasterTransaction(db);
    const disasterService: IDisasterService = new DisasterService(disasterTransaction);
    const disasterController: IDisasterController = new DisasterController(disasterService);

    hono.post("/", (ctx) => disasterController.createDisaster(ctx));
    return hono;
};