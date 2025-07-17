import { type ZodIssue, z } from 'zod'

/**
 * An application error
 */
export class AppError extends Error {
  code: string
  message: string
  context: { issues?: ZodIssue[]; error?: Error; data: unknown }

  constructor(
    code: string,
    message: string,
    context: { issues?: ZodIssue[]; error?: Error; data: unknown },
  ) {
    super()
    this.code = code
    this.message = message
    this.context = context
  }
}

type SerializedAppError = {
  code: string
  message: string
  context?: { issues?: ZodIssue[]; error?: Error; data: unknown }
}

/**
 * An custom application error
 */
export type AppErrorInstance = InstanceType<typeof AppError>

function isAppError(error: unknown) {
  if (error instanceof AppError) return true
  return false
}

export type ResultType<T> =
  | { data: T; error: null }
  | { data: null; error: AppErrorInstance }

export type RTP<T> = Promise<ResultType<T>>

export function ok<T>(val: T): { data: T; error: null } {
  return { data: val, error: null }
}

export function err(error: AppErrorInstance): {
  data: null
  error: AppErrorInstance
} {
  return { data: null, error }
}

/**
 * A serialized custom application error
 */

export type SerializedResultType<T> =
  | { key: string; data: T; error: null }
  | { key: string; data: null; error: SerializedAppError }

/**
 * Takes an exception value, and returns a ResultType with an AppError
 *  if the exception value is an AppError or an Error. If an exception
 *  value is passed that is not an AppError or Error then that value
 *  is re-thrown.
 */
export function catchToResult(
  error: unknown,
  context: { issues?: ZodIssue[]; error?: Error; data: unknown },
): { data: null; error: AppError } {
  if (isAppError(error)) {
    return { data: null, error: error as AppError }
  }
  if (error instanceof Error) {
    return {
      data: null,
      error: new AppError('UNEXPECTED', 'An unexpected error occurred.', {
        error,
        ...context,
      }),
    }
  }
  // You can throw anything, if its not an error just re-throw it
  // It might be a redirect or something like that, so let it go throw
  throw error
}

/**
 * Takes an exception value, and returns a ResultType with a SerializedAppError
 *  if the exception value is an AppError or an Error. If an exception
 *  value is passed that is not an AppError or Error then that value
 *  is re-thrown.
 */
export function serializeError(
  error: unknown,
  key: string,
  context?: { issues?: ZodIssue[]; error?: Error; data: unknown },
): { key: string; data: null; error: SerializedAppError } {
  console.error(error)
  if (error instanceof AppError) {
    return {
      key,
      data: null,
      error: {
        code: error.code,
        message: error.message,
        context: error.context,
      },
    }
  }
  if (error instanceof Error) {
    return {
      key,
      data: null,
      error: { code: 'UNEXPECTED', message: error.message, context },
    }
  }
  // You can throw anything, if its not an error just re-throw it
  // It might be a redirect or something like that, so let it go throw
  throw error
}

/**
 * Takes a ResultType value, and returns a SerializedResultType
 */
export function serializeResult<T>(
  result: ResultType<T>,
  key: string,
): SerializedResultType<T> {
  if (result.error) return serializeError(result.error, key)
  return { key, data: result.data, error: null } as SerializedResultType<T>
}
