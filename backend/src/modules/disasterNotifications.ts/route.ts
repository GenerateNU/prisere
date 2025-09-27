import { DataSource } from "typeorm";
import { Hono } from "hono";

export const disasterNotificationRoutes = (db: DataSource): Hono => {
    const disasterNotification = new Hono();

    return disasterNotification;
}