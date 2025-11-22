import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { openApiErrorCodes } from "../../utilities/error";
import { FemaRiskIndexController } from "../fema-risk-index-data/controller";
import { FemaRiskIndexService } from "../fema-risk-index-data/service";
import { FemaRiskTransaction } from "../fema-risk-index-data/transaction";
import { insertFemaRiskIndexDataInputSchema } from "../fema-risk-index-data/types";

export const addOpenApiFemaRiskIndexRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction = new FemaRiskTransaction(db);
    const service = new FemaRiskIndexService(transaction);
    const controller = new FemaRiskIndexController(service);

    openApi.openapi(getFemaRiskData, (ctx) => controller.getFemaRiskIndexData(ctx));
    openApi.openapi(updateFemaRiskIndexData, (ctx) => controller.updateFemaRiskIndexData(ctx));
    return openApi;
};

const getFemaRiskData = createRoute({
    method: "get",
    path: "/fema-risk-index",
    summary: "Get all of the fema risk index data",
    description: "Get all of the fema risk index data",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: insertFemaRiskIndexDataInputSchema,
                },
            },
            description: "Fema risk index data",
        },
        ...openApiErrorCodes("Fetching fema index data"),
    },
    tags: ["fema-risk-data"],
});

const updateFemaRiskIndexData = createRoute({
    method: "post",
    path: "/fema-risk-index",
    summary: "Updates all of the fema risk index data",
    description: "Will delete the existing fema risk index data in the table and re import all of the index data",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.number(),
                },
            },
            description: "Update risk index data",
        },
        ...openApiErrorCodes("Getting Disaster Error"),
    },
    tags: ["Disaster"],
});
