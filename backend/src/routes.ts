import { Context, Hono, TypedResponse } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";
import { locationAddressRoute } from "./modules/location-address/route";
import { companyRoutes } from "./modules/company/route";
import { disasterRoutes } from "./modules/disaster/route";
import { claimRoutes } from "./modules/claim/route";
import { disasterNotificationRoutes } from "./modules/disasterNotifications/route";
import { StatusCode } from "hono/utils/http-status";

import { quickbooksRoutes } from "./modules/quickbooks/routes";
import { invoiceRoutes } from "./modules/invoice/route";
import { claimLocationRoutes } from "./modules/claim-location/route";
import { purchaseRoutes } from "./modules/purchase/route";
import { preferenceRoutes } from "./modules/preferences/route";
import { invoiceLineItemsRoutes } from "./modules/invoiceLineItem/route";

export const setUpRoutes = (app: Hono<any>, db: DataSource) => {
    const routes = new Hono();
    routes.route("/", healthRoutes());
    routes.route("/users", userRoutes(db));
    routes.route("/location-address", locationAddressRoute(db));
    routes.route("/companies", companyRoutes(db));
    routes.route("/disaster", disasterRoutes(db));
    routes.route("/notifications", disasterNotificationRoutes(db));
    routes.route("/claims", claimRoutes(db));
    routes.route("/quickbooks", quickbooksRoutes(db));
    routes.route("/invoice", invoiceRoutes(db));
    routes.route("/invoice/line", invoiceLineItemsRoutes(db));
    routes.route("/purchase", purchaseRoutes(db));
    routes.route("/preferences", preferenceRoutes(db));
    routes.route("/claim-locations", claimLocationRoutes(db));

    app.route("/api/prisere", routes);
    app.route("/api/openapi", setUpOpenApiRoutes(db));
};

const healthRoutes = (): Hono => {
    const app = new Hono();
    app.get("/", (ctx: Context): TypedResponse<{ message: string }, StatusCode> => {
        return ctx.json({ message: "Welcome to Prisere" }, 200);
    });
    app.get("/healthcheck", (ctx: Context): TypedResponse<{ message: string }, StatusCode> => {
        return ctx.json({ message: "OK" }, 200);
    });
    return app;
};
