import "reflect-metadata"
import { Hono } from "hono";
import { DataSource } from "typeorm";
import { newDb, DataType } from "pg-mem";
import { runSeeders } from "typeorm-extension";
import { setUpRoutes } from "../routes";
import { User } from "../entities/User.js";
import { v4 } from "uuid";
import { TestAppData } from "../types/Test";
import { Company } from "../entities/Company";

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

const TestDataSource: DataSource = await db.adapters.createTypeormDataSource({
    type: "postgres",
    entities: [User, Company],
});

export const startTestApp = async (): Promise<TestAppData> => {
    const app = new Hono();
    await TestDataSource.initialize();
    await TestDataSource.synchronize();
    await runSeeders(TestDataSource);
    const backup = db.backup();

    setUpRoutes(app, TestDataSource);
    return { app, backup };
};
