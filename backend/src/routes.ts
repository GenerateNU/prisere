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

export const setUpRoutes = (app: Hono, db: DataSource) => {
    app.route("/", healthRoutes())
    app.route("/users", userRoutes(db));
    app.route("/location-address", locationAddressRoute(db));
    app.route("/companies", companyRoutes(db));
    app.route("/openapi", setUpOpenApiRoutes(db));
    app.route("/disaster", disasterRoutes(db));
    app.route("/claims", claimRoutes(db));
    app.route("/disasterNotification", disasterNotificationRoutes(db));
    app.route("/quickbooks", quickbooksRoutes(db));
    app.route("/quickbooks/invoice", invoiceRoutes(db));
};


const healthRoutes = (): Hono => {
    const app = new Hono();
    app.get("/", (ctx: Context): TypedResponse<{message:string}, StatusCode> => {
        return ctx.json({ message: "Welcome to Prisere" }, 200);
    } )
    app.get("/healthcheck", (ctx: Context): TypedResponse<{message:string}, StatusCode>=> {
        return ctx.json({ message: "OK" }, 200);
      });
    return app
}