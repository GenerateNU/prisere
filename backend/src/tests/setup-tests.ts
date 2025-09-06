import { Hono } from "hono";
import { AppDataSource } from "../typeorm-config";
import { runSeeders } from "typeorm-extension";
import { setUpRoutes } from "../routes";

export const startTestApp = async (): Promise<Hono> => {
    const app = new Hono();
  
    await AppDataSource.initialize();
    await runSeeders(AppDataSource);

    setUpRoutes(app, AppDataSource)
    return app;
};