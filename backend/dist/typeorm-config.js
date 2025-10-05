import { DataSource } from "typeorm";
import { config } from "dotenv";
import UserSeeder from "./database/seeds/user.seed.js";
import UserFactory from "./database/factories/user.factory.js";
config({ path: ".env" });
const databaseUrl = process.env.NODE_ENV === "production" ? process.env.SUPABASE_PROD_DB_URL : process.env.SUPABASE_DB_URL;
const options = {
    type: "postgres",
    url: databaseUrl,
    synchronize: false,
    logging: false,
    entities: ["src/entities/*.{ts,js}"],
    migrations: ["src/migrations/*.ts"],
    seeds: [UserSeeder],
    seedTracking: false,
    factories: [UserFactory],
};
export const AppDataSource = new DataSource(options);
