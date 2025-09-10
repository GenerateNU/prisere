import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
) => {
    app.route("/api", apiRoutes(db));
};

const apiRoutes = (
    db: DataSource,
) => {
    const api = new Hono()
    api.route("/users", userRoutes(db));

    return api
}

