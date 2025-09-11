import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
) => {
    app.route("/users", userRoutes(db));

    app.route('/openapi', setUpOpenApiRoutes(db));
};

