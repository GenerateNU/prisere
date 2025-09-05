import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import config from '../../drizzle.config'

const connectionString = config.dbCredentials.connectionString;

export const client = postgres(connectionString)
export const db = drizzle(client);