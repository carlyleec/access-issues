import { AppError, catchToResult, ok, type RTP } from '~/lib/result'
import type { UserRepo } from '../repo/user-repo'
import { validate as validateToken } from '~/lib/token'
import { compare as compareHash } from '~/lib/hash'
import type { SessionData } from '../session'

const NUM_MILLISECONDS_IN_20_MINUTES = 1000 * 60 * 20

async function execute(
  jwt: string,
  otp: string,
  userRepo: UserRepo,
): RTP<SessionData> {
  try {
    const tokenResult = validateToken(jwt, {
      isExpirable: true,
      maxAge: NUM_MILLISECONDS_IN_20_MINUTES,
    })
    if (tokenResult.error) return tokenResult
    const user = await userRepo.byEmail(tokenResult.data.payload)
    if (!user)
      throw new AppError(
        'AUTHENTICATION',
        'Unable to find user to authenticate.',
        {
          data: tokenResult.data,
        },
      )

    const validatedTokenHash = await compareHash(
      tokenResult.data.token,
      user.tokenHash ?? '',
    )
    if (validatedTokenHash.error)
      throw new AppError('AUTHENTICATION', 'Invalid token hash', {
        data: {
          token: tokenResult.data.token,
          tokenHash: user.tokenHash,
        },
      })
    const validatedOtpHash = await compareHash(otp, user.otpHash ?? '')
    if (validatedOtpHash.error)
      throw new AppError('AUTHENTICATION', 'Invalid OTP', {
        data: {
          otp,
          otpHash: user.otpHash,
        },
      })
    return ok({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    return catchToResult(error, {
      data: { jwt, otp },
    })
  }
}

export function newAuthenticateCmd(userRepo: UserRepo) {
  return (jwt: string, otp: string) => execute(jwt, otp, userRepo)
}

export type AuthenticateCmd = ReturnType<typeof newAuthenticateCmd>
