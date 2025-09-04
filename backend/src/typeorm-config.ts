import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from 'typeorm-extension';
import { User } from "./entities/User";

const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  url: process.env.POSTGRES_URL,
  password: process.env.SUPABASE_PASSWORD,
  synchronize: false,               
  logging: false,
  entities: [User],
  migrations: ["supabase/migrations/*.ts"],
  seeds: ['src/database/seeds/**/*.ts'],
  seedTracking: false,
  factories: ['src/database/factories/**/*.ts'],
};

export const AppDataSource = new DataSource(options);