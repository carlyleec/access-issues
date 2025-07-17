import { type AppError } from '../../lib/result'

export function logAppError(appError: AppError) {
  console.error(
    new Date().toISOString(),
    appError.code,
    appError.message,
    JSON.stringify(appError.context),
  )
}
