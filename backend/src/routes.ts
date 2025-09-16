import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";
import { companyRoutes } from "./modules/company/route";

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
) => {
    app.route("/users", userRoutes(db));
    app.route("/companies", companyRoutes(db));

    app.route('/openapi', setUpOpenApiRoutes(db));
};

