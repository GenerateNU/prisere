import { Hono } from "hono";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";

export const setUpRoutes = (
    app: Hono,
    db: DataSource,
  ) => {
    setUpApiV1Routes(app, db);
};


const setUpApiV1Routes = (app: Hono, db: DataSource) => {
    app.route("/", apiRoutes(db));
};

const apiRoutes = (
    db: DataSource,
): Hono => {
    const api = new Hono();
  
    api.route("/users", userRoutes(db));
    return api;
};
