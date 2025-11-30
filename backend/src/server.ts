import "reflect-metadata";
import "./dayjs.config";

import { Hono } from "hono";
import { logger } from "hono/logger";
import { AppDataSource } from "./typeorm-config";
import { setUpRoutes } from "./routes";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";
import { isAuthorized } from "./utilities/auth-middleware";
import { cors } from "hono/cors";
import { initCronJobs } from "./utilities/cron-jobs/initJobs";

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
                allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                credentials: true,
                maxAge: 3600,
            })
        );

        const apiPrefix = process.env.NODE_ENV === "production" ? "/prisere" : "/api/prisere";

        app.use(`${apiPrefix}/*`, async (ctx, next) => {
            // Skip the middleware for the /quickbooks/redirect route
            if (ctx.req.path === `${apiPrefix}/quickbooks/redirect`) {
                return next();
            }

            // Apply the isAuthorized middleware for all other routes
            return isAuthorized()(ctx, next);
        });

        setUpRoutes(app, AppDataSource, apiPrefix);

        await initCronJobs(AppDataSource);

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
