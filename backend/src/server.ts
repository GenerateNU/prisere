import "reflect-metadata"
import { Hono } from "hono"
import {AppDataSource} from "./typeorm-config";
import { DataSource } from "typeorm";
import { userRoutes } from "./modules/user/route";

const app = new Hono();
app.get("/", (c) => c.text("Server is running!"));
app.get("/health", (c) => c.json({ status: "ok" }));

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
        app.use("*", async (c, next) => {
            console.log(`Incoming request: ${c.req.method} ${c.req.path}`);
            await next();
          });
        app.route("/api/v1", apiRoutes(AppDataSource))
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

