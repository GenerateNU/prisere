import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { User } from "./entities/User.js";
import { config } from "dotenv";
import UserSeeder from "./database/seeds/User.js";
import UserFactory from "./database/factories/user.factory.js";
config({ path: ".env" });

const databaseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.SUPABASE_PROD_DB_URL
    : process.env.SUPABASE_DB_URL;


const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  url: databaseUrl,
  password: process.env.SUPABASE_PASSWORD,
  synchronize: false,               
  logging: false,
  entities: [User],
  migrations: ["src/migrations/*.ts"],
  seeds: [UserSeeder],
  seedTracking: false,
  factories: [UserFactory],
};

export const AppDataSource = new DataSource(options);

export const initializeDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export const runDatabaseSeeders = async () => {
  await initializeDataSource();
  await runSeeders(AppDataSource);
};