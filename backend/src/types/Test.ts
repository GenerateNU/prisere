import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";

export type TestAppData = {
    app: Hono;
    backup: IBackup;
    dataSource: DataSource;
};
