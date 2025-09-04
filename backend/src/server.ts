import "reflect-metadata"
import { Hono } from "hono"
import {AppDataSource} from "./typeorm-config";

const app = new Hono();

const startServer = async () => {
    try {
        await AppDataSource.initialize()
        console.log("Connected to Postgres!")
    } catch(err:any) {
        console.log("Error starting app", err)
    }
}

startServer();
