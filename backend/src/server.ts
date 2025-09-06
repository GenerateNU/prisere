import "reflect-metadata"
import { Hono} from "hono"
import { logger } from 'hono/logger'
import {AppDataSource} from "./typeorm-config";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";

const app = new Hono();

const apiRoutes = (
    db: DataSource,
  ): Hono => {
    const api = new Hono();
    api.route("/users", userRoutes(db))
    return api;
  };

(async function setUpServer() {
    try {
        await AppDataSource.initialize()

        // built in hono logging to console
        app.use("*", logger())

        // custom logging to /log files
        app.use("*", logger(logMessageToFile));
        
        app.onError(errorHandler);

        app.get("/health", (c) => c.json({ status: "ok" }));
        app.get("/", (c) => c.text("Server is running!"));
        app.route("/api/v1", apiRoutes(AppDataSource));

        console.log("Connected to Postgres!")
    } catch(err:any) {
        console.log("Error starting app", err)
    }
})();

const server = {
    port: 3000,
    fetch: app.fetch,
};
  
export default server;

