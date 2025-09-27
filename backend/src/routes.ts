import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";
<<<<<<< HEAD
=======
import { locationAddressRoute } from "./modules/location-address/route";
import { companyRoutes } from "./modules/company/route";
>>>>>>> main
import { disasterRoutes } from "./modules/disaster/route";

export const setUpRoutes = (app: Hono, db: DataSource) => {
    app.route("/users", userRoutes(db));
    app.route("/location-address", locationAddressRoute(db));
    app.route("/users", userRoutes(db));
    app.route("/companies", companyRoutes(db));
    app.route("/openapi", setUpOpenApiRoutes(db));
    app.route("/disaster", disasterRoutes(db));
};
