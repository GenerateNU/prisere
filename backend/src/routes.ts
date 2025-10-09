import { Context, Hono, TypedResponse } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";
import { locationAddressRoute } from "./modules/location-address/route";
import { companyRoutes } from "./modules/company/route";
import { disasterRoutes } from "./modules/disaster/route";
import { disasterNotificationRoutes } from "./modules/disasterNotifications/route";
import { StatusCode } from "hono/utils/http-status";

export const setUpRoutes = (app: Hono, db: DataSource) => {
    app.route("/api/prisere/", healthRoutes())
    app.route("/api/prisere/users", userRoutes(db));
    app.route("/api/prisere/location-address", locationAddressRoute(db));
    app.route("/api/prisere/companies", companyRoutes(db));
    app.route("/api/openapi", setUpOpenApiRoutes(db));
    app.route("/api/prisere/disaster", disasterRoutes(db));
    app.route("/api/perisre/disasterNotification", disasterNotificationRoutes(db));
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