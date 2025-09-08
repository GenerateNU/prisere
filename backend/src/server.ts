import "reflect-metadata"
import { Hono} from "hono"
import { logger } from 'hono/logger'
import {AppDataSource} from "./typeorm-config";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";
import { setUpRoutes } from "./routes";

const app = new Hono();

(async function setUpServer() {
    try {
        await AppDataSource.initialize()
        app.use("*", logger());
        setUpRoutes(app, AppDataSource)
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

