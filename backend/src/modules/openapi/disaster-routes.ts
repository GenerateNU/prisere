import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { DisasterTransaction } from "../disaster/transaction";
import { DisasterService } from "../disaster/service";
import { DisasterController } from "../disaster/controller";
import {createDisasterRoute, getAllDisastersRoute} from "@prisere/types"

export const addOpenApiDisasterRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const disasterTransaction = new DisasterTransaction(db);
    const disasterService = new DisasterService(disasterTransaction);
    const disasterController = new DisasterController(disasterService);

    openApi.openapi(createDisasterRoute, (ctx) => disasterController.createDisaster(ctx));
    openApi.openapi(getAllDisastersRoute, (ctx) => disasterController.getAllDisasters(ctx));
    return openApi;
};
