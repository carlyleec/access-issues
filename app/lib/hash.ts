import bcrypt from 'bcryptjs'

import { catchToResult, ok } from '~/lib/result'

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
    return ok(bcrypt.compare(value, hashedValue))
  } catch (error) {
    return catchToResult(error, {
      data: { value, hashedValue },
    })
  }
}
