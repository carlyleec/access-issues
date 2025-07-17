import bcrypt from 'bcryptjs'

import { AppError, catchToResult, err, ok } from '~/lib/result'

export async function hash(value: string) {
  try {
    return ok(await bcrypt.hash(value, 10))
  } catch (error) {
    return catchToResult(error, {
      data: { value },
    })
  }
}

export async function compare(value: string, hashedValue: string) {
  try {
    const res = await bcrypt.compare(value, hashedValue)
    if (!res)
      return err(
        new AppError('HASH', 'Invalid hash', {
          data: { value, hashedValue },
        }),
      )
    return ok(res)
  } catch (error) {
    return catchToResult(error, {
      data: { value, hashedValue },
    })
  }
}
