import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
  ) => {
    app.route("/users", userRoutes(db));
};

