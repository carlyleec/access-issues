import * as crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '~/env'

import { type ResultType, catchToResult, ok } from '~/lib/result'

import { AppError } from './result'
import { hash } from './hash'

const NUM_MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24
const MAX_AGE = NUM_MILLISECONDS_IN_A_DAY

const TokenPayloadSchema = z.object({
  iat: z.number().int().positive(),
  token: z.string(),
  payload: z.string(),
})

export type TokenPayload = z.infer<typeof TokenPayloadSchema>

export async function generate(payload: string) {
  try {
    const iat = new Date().getTime()
    const token = crypto.randomUUID()
    const hashRes = await hash(token)
    if (hashRes.error) throw hashRes.error
    const secret = env.TOKEN_SECRET
    return ok({
      jwt: jwt.sign({ iat, token, payload }, secret),
      tokenHash: hashRes.data,
    })
  } catch (error) {
    return catchToResult(error, {
      data: { payload },
    })
  }
}

const hasExpired = (iat: number, maxAge: number) => {
  const now = new Date().getTime()
  return now - iat > maxAge
}

export function validate(
  token: string,
  { maxAge, isExpirable } = { maxAge: MAX_AGE, isExpirable: true },
): ResultType<TokenPayload> {
  try {
    const verified = jwt.verify(token, env.TOKEN_SECRET)
    const parsed = TokenPayloadSchema.safeParse(verified)
    if (!parsed.success)
      throw new AppError('TOKEN', 'Invalid Payload', {
        data: { token },
      })

    if (isExpirable && hasExpired(parsed.data.iat, maxAge)) {
      throw new AppError('TOKEN', 'Expired', {
        data: { token },
      })
    }

    return ok(parsed.data)
  } catch (error) {
    return catchToResult(error, {
      data: { token },
    })
  }
}
