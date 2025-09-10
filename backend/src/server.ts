import "reflect-metadata"
import { Hono } from "hono"
import { logger } from 'hono/logger'
import { AppDataSource } from "./typeorm-config";
import { setUpRoutes } from "./routes";
import { errorHandler } from "./utilities/error";
import { logMessageToFile } from "./utilities/logger";

import {jwt} from "hono/jwt"
import { config } from "dotenv";
config({ path: ".env" });


const app = new Hono();

(async function setUpServer() {
    try {
        await AppDataSource.initialize()
        // built in hono logging to console
        app.use("*", logger())

        // custom logging to /log files
        app.use("*", logger(logMessageToFile));
        
        app.onError(errorHandler);
        setUpRoutes(app, AppDataSource)

        app.use('/api/*', (c, next) => {
            const jwtMiddleware = jwt({
              secret: process.env.JWT_SECRET!,
            })
            return jwtMiddleware(c, next)
        })

        console.log("Connected to Postgres!")
    } catch(err:any) {
        console.log("Error starting app", err)
    }
})();

const server = {
    port: 8080,
    fetch: app.fetch,
};
  
export default server;

