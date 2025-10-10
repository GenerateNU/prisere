import "reflect-metadata";
import "../dayjs.config";

import { Hono } from "hono";
import { DataSource } from "typeorm";
import { newDb, DataType, IMemoryDb } from "pg-mem";
import { runSeeders } from "typeorm-extension";
import { setUpRoutes } from "../routes";
import { v4 } from "uuid";
import { TestAppData } from "../types/Test";

const createNewDB = async (): Promise<IMemoryDb> => {
    const db = newDb({
        autoCreateForeignKeyIndices: true,
    });

    // pg-mem doesn't support all functions so we have to define
    // these customs ones for it to work with our tests
    db.public.registerFunction({
        name: "version",
        returns: DataType.text,
        implementation: () => "PostgreSQL 17.4",
    });

    db.public.registerFunction({
        name: "current_database",
        returns: DataType.text,
        implementation: () => "test_db",
    });

    db.public.registerFunction({
        name: "uuid_generate_v4",
        returns: DataType.uuid,
        implementation: v4,
        impure: true,
    });

    return db;
};

type ContextVariables = {
    userId: string
  }

  
export const startTestApp = async (): Promise<TestAppData> => {
    const app = new Hono<{ Variables: ContextVariables }>();
    const db = await createNewDB();
    const dataSource: DataSource = await db.adapters.createTypeormDataSource({
        type: "postgres",
        entities: ["src/entities/*.ts"],
    });


    await dataSource.initialize();
    await dataSource.synchronize();
    await runSeeders(dataSource);
    const backup = db.backup();

    app.use('*', async (c, next) => {
        c.set('userId', '3c191e85-7f80-40a6-89ec-cbdbff33a5b2')
        await next()
    })
    
    setUpRoutes(app, dataSource);
    return { app, backup, dataSource };
};
