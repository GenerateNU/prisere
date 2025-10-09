import "reflect-metadata";
import "./dayjs.config";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { AppDataSource } from "./typeorm-config";
import { setUpRoutes } from "./routes";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";
import { FemaService, IFemaService } from "./modules/clients/fema-client/service";
import { FemaFetching } from "./utilities/cron_job_handler";
import { isAuthorized } from "./utilities/auth-middleware";
import { cors } from "hono/cors";
import { setUpOpenApiRoutes } from "./modules/openapi/all-routes";

const app = new Hono();

(async function setUpServer() {
    try {
        await AppDataSource.initialize();

        // built in hono logging to console
        app.use("*", logger());

        // custom logging to /log files
        app.use("*", logger(logMessageToFile));

        app.onError(errorHandler);

        app.use(
            "*",
            cors({
                origin: ["http://localhost:3000", "https://walrus-app-kwuoe.ondigitalocean.app"],
                allowHeaders: ["Origin", "Content-Type", "Authorization"],
                allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                credentials: true,
                maxAge: 3600,
            })
        );

        app.use("/api/prisere/*", isAuthorized());

        setUpRoutes(app, AppDataSource);

        const femaService: IFemaService = new FemaService(AppDataSource);
        await femaService.preloadDisasters();
        const femaDisastersCron = new FemaFetching(femaService);
        femaDisastersCron.initializeCron();

        console.log("Connected to Postgres!");
    } catch (err) {
        console.log("Error starting app", err);
    }
})();

const server = {
    port: 3001,
    fetch: app.fetch,
};

export default server;
