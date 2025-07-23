/* eslint-disable no-undef */
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    POSTGRES_URL: z.string().url(),
    GOOGLE_SHEETS_REPORT_SHEET_ID: z.string().min(1),
    // think this might be necessary at some point
    GOOGLE_PROJECT_ID: z.string().min(1),
    GOOGLE_PRIVATE_KEY: z.string().min(1),
    GOOGLE_CLIENT_EMAIL: z.string().email(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    WEB_SESSION_SECRET: z.string().min(1),
    TOKEN_SECRET: z.string().min(1),
    FROM_EMAIL: z.string().email(),
    SEND_GRID_API_KEY: z.string().min(1),
    SITE_URL: z.string().url(),
    DEV_EMAIL: z.string().email(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  // client: {
  //   // NEXT_PUBLIC_CLIENTVAR: z.string(),
  // },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    GOOGLE_SHEETS_REPORT_SHEET_ID: process.env.GOOGLE_SHEETS_REPORT_SHEET_ID,
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    WEB_SESSION_SECRET: process.env.WEB_SESSION_SECRET,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    FROM_EMAIL: process.env.FROM_EMAIL,
    SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY,
    SITE_URL:
      process.env.VERCEL_ENV === 'production' ||
      process.env.VERCEL_ENV === 'development'
        ? process.env.SITE_URL
        : `https://${process.env.VERCEL_URL}`,
    DEV_EMAIL: process.env.DEV_EMAIL || 'example@example.com',
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
