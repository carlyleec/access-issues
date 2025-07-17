import * as crypto from 'crypto'

import { AppError, catchToResult, ok } from './result'

import { hash, compare } from './hash'

export async function generate() {
  try {
    let otp = ''
    for (let index = 0; index < 6; index++) {
      otp += crypto.randomInt(0, 10).toString()
    }
    const hashRes = await hash(otp)
    if (hashRes.error) throw hashRes.error
    return ok({ otp, otpHash: hashRes.data })
  } catch (error) {
    return catchToResult(error, { data: {} })
  }
}

export async function validate(otp: string, otpHash: string) {
  try {
    const success = compare(otp, otpHash)

    if (!success)
      throw new AppError('OTP', 'Invalid OTP', { data: { otp, otpHash } })

    return ok(success)
  } catch (error) {
    return catchToResult(error, { data: { otp, otpHash } })
  }
}
