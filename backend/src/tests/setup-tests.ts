import { Hono } from "hono";
import { AppDataSource } from "../typeorm-config";
import { runSeeders } from "typeorm-extension";
import { DataSource } from "typeorm";
import { userRoutes } from "../modules/user/route";

const apiRoutes = (
    db: DataSource,
  ): Hono => {
    const api = new Hono();
    api.route("/users", userRoutes(db))
    return api;
};

export const startTestApp = async (): Promise<Hono> => {
    const app = new Hono();
  

    await AppDataSource.initialize();
    await runSeeders(AppDataSource);

    app.get("/health", (c) => c.json({ status: "ok" }));
    app.get("/", (c) => c.text("Server is running!"));
    app.route("/api/v1", apiRoutes(AppDataSource));

    return app;
};