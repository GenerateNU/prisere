import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { addOpenApiUserRoutes } from "./user-route";
import { addOpenApiDisasterRoutes } from "./disaster-routes";
import { addOpenApiCompanyRoutes } from "./company-routes";
import { addOpenApiLocationAddressRoutes } from "./location-address-route";
import { addOpenApiDisasterNotificationRoutes } from "./disaster-notification-routes";
import { addOpenApiQBRoutes } from "./quickbooks-routes";
import { addOpenApiInvoiceRoutes } from "./invoice-routes";
import { addOpenApiPurchaseRoutes } from "./purchase-routes";
import { createOpenAPIClaimRoutes } from "./claim-routes";
import { addOpenApiClaimLocationRoutes } from "./claim-location-routes";
import { addOpenApiPreferenceRoutes } from "./preference-routes";
import { addOpenApiInvoiceLineItemRoutes } from "./invoice-line-item-routes";
import { addOpenApiPurchaseLineItemRoutes } from "./purchase-line-item";
import { addOpenApiSelfDisasterRoutes } from "./self-declared-disasters";
import { addOpenApiInsurancePolicyRoutes } from "./insurance-policy-routes";

export const setUpOpenApiRoutes = (db: DataSource) => {
    const openApiApp = openApiRoutes(db);

    openApiApp.doc("/spec.json", {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Prisere API",
        },
        servers: [
            {
                url: "/api/prisere",
            },
        ],
    });

    openApiApp.get("/docs", swaggerUI({ url: "spec.json" }));
    return openApiApp;
};

const openApiRoutes = (db: DataSource): OpenAPIHono => {
    const openApi = new OpenAPIHono();

    addOpenApiUserRoutes(openApi, db);
    addOpenApiCompanyRoutes(openApi, db);
    addOpenApiDisasterRoutes(openApi, db);
    addOpenApiLocationAddressRoutes(openApi, db);
    addOpenApiDisasterNotificationRoutes(openApi, db);
    addOpenApiQBRoutes(openApi, db);
    addOpenApiInvoiceRoutes(openApi, db);
    addOpenApiPurchaseRoutes(openApi, db);
    createOpenAPIClaimRoutes(openApi, db);
    addOpenApiClaimLocationRoutes(openApi, db);
    addOpenApiPreferenceRoutes(openApi, db);
    addOpenApiInvoiceLineItemRoutes(openApi, db);
    addOpenApiPurchaseLineItemRoutes(openApi, db);
    addOpenApiSelfDisasterRoutes(openApi, db);
    addOpenApiInsurancePolicyRoutes(openApi, db);

    return openApi;
};
