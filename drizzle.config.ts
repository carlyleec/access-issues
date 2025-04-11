import { defineConfig } from 'drizzle-kit'
import { env } from '~/env'

export default defineConfig({
  out: './migrations',
  schema: './app/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
})
