import { sql } from '@vercel/postgres'
import {
  PostgresJsDatabase,
  drizzle as localDrizzle,
} from 'drizzle-orm/postgres-js'
import {
  type VercelPgDatabase,
  drizzle as vercelDrizzle,
} from 'drizzle-orm/vercel-postgres'
import postgres from 'postgres'
import { env } from '~/env'

import * as schema from './schema'

export type VercelDb = VercelPgDatabase<typeof schema>
export type LocalDb = PostgresJsDatabase<typeof schema>
export type Db = LocalDb | VercelDb
export type DbSchema = typeof schema

let db: Db
/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}
if (env.NODE_ENV === 'production') {
  db = vercelDrizzle(sql, { schema })
} else {
  const conn = globalForDb.conn ?? postgres(env.POSTGRES_URL, { max: 20 })
  db = localDrizzle(conn, {
    logger: true,
    schema,
  })
}

export { db }
