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
    const routes = new Hono();
    routes.route("/", healthRoutes());
    routes.route("/users", userRoutes(db));
    routes.route("/location-address", locationAddressRoute(db));
    routes.route("/companies", companyRoutes(db));
    routes.route("disaster", disasterRoutes(db));
    routes.route("/disasterNotification", disasterNotificationRoutes(db));

    app.route("/api/prisere", routes)
    app.route("/api", setUpOpenApiRoutes(db))
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
