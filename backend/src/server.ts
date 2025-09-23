import "reflect-metadata";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { AppDataSource } from "./typeorm-config";
import { setUpRoutes } from "./routes";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";
import { FemaService } from "./modules/clients/fema-client/service";

const app = new Hono();

(async function setUpServer() {
    try {
        await AppDataSource.initialize();

        // built in hono logging to console
        app.use("*", logger());

        // custom logging to /log files
        app.use("*", logger(logMessageToFile));

        app.onError(errorHandler);

        setUpRoutes(app, AppDataSource);

        new FemaService(AppDataSource).fetchFemaDisasters({ lastRefreshDate: new Date("2025-09-01") });

        console.log("Connected to Postgres!");
    } catch (err) {
        console.log("Error starting app", err);
    }
})();

const server = {
    port: 3000,
    fetch: app.fetch,
};

export default server;
