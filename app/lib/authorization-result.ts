import type { ZodIssue } from 'zod'
import { AppError, err, ok, type AppErrorInstance } from './result'

export function authorizationResult(
  authorized: boolean,
  errorMessage: string,
  errorContext: { issues?: ZodIssue[]; error?: Error; data: unknown },
) {
  if (authorized) return ok(true)
  return err(
    new AppError(
      'AUTHORIZATION',
      errorMessage,
      errorContext,
    ) as AppErrorInstance,
  )
}
