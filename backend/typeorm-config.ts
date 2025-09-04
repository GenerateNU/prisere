import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from 'typeorm-extension';
import { User } from "./src/entities/User";


const options: DataSourceOptions & SeederOptions = {
  type: "postgres",
  url: process.env.NODE_ENV == "production" 
    ? process.env.SUPABASE_PROD_URL 
    : process.env.SUPABASE_LOCAL_URL,
  synchronize: false,               
  logging: true,
  entities: [User],
  migrations: ["supabase/migrations/*.ts"],
  seeds: ['src/database/seeds/**/*{.ts}'],
  seedTracking: false,
  factories: ['src/database/factories/**/*{.ts}'],
};

export const AppDataSource = new DataSource(options);