import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from 'typeorm-extension';
import { config } from "dotenv";
import UserSeeder from "./database/seeds/user.seed.js";
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
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  seeds: [UserSeeder],
  seedTracking: false,
  factories: [UserFactory],
};

export const AppDataSource = new DataSource(options);
