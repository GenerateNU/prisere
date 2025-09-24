import "reflect-metadata";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { AppDataSource } from "./typeorm-config";
import { setUpRoutes } from "./routes";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";
import { IFemaService, FemaService } from "./modules/clients/fema-client/service";
import { FemaFetching } from "./utilities/cron_job_handler";

const app = new Hono();

const preloadFemaDisasters= async (femaService: IFemaService) => {
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() - 3);
    console.log();
    femaService.fetchFemaDisasters({lastRefreshDate: threeMonths});
}

(async function setUpServer() {
    try {
        await AppDataSource.initialize();

        // built in hono logging to console
        app.use("*", logger());

        // custom logging to /log files
        app.use("*", logger(logMessageToFile));

        app.onError(errorHandler);

        setUpRoutes(app, AppDataSource);


        // this is for fetching fema disasters, first the three month backlog
        const femaService = new FemaService(AppDataSource);
        await preloadFemaDisasters(femaService);
        // then initialize cron job
        const cronJob = new FemaFetching(femaService);
        cronJob.initializeCron();

        console.log("Connected to Postgres!");
    } catch (err) {
        console.log("Error starting app", err);
    }
});

const server = {
    port: 3000,
    fetch: app.fetch,
};

export default server;
