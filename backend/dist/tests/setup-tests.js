import "reflect-metadata";
import { Hono } from "hono";
import { newDb, DataType } from "pg-mem";
import { runSeeders } from "typeorm-extension";
import { setUpRoutes } from "../routes";
import { v4 } from "uuid";
const createNewDB = async () => {
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
export const startTestApp = async () => {
    const app = new Hono();
    const db = await createNewDB();
    const dataSource = await db.adapters.createTypeormDataSource({
        type: "postgres",
        entities: ["src/entities/*.ts"],
    });
    await dataSource.initialize();
    await dataSource.synchronize();
    await runSeeders(dataSource);
    const backup = db.backup();
    setUpRoutes(app, dataSource);
    return { app, backup, dataSource };
};
