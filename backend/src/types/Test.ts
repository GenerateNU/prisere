import { Hono } from "hono";
import { IBackup } from "pg-mem";

export type TestAppData = {
    app: Hono;
    backup: IBackup;
};
