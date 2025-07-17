import { env } from '~/env'
import type { EmailService } from '../services/email-service'
import { AppError, catchToResult, ok } from '~/lib/result'
import { generate as generateOtp } from '~/lib/otp'
import { generate as generateToken } from '~/lib/token'
import type { UserRepo } from '../repo/user-repo'
import { z } from 'zod'

function otpTextTemplate({ otp }: { otp: string }) {
  return `
	Your Access Issues verification code is:  ${otp}
	This code will expire in 2 minutes.
	If you didn't request this, you can safely ignore it.
`
}

function otpHtmlTemplate({ otp }: { otp: string }) {
  return `
	<table
		style="font-family: Arial, Helvetica, sans-serif; text-align: center; position: relative;  color: #111827; margin:0 auto;width:100%;max-width:400px;">
		<tr>
			<td><h1 style="font-size: 24px; font-weight: bold; color: #111827;">Access Issues</h1></td>
		</tr>
		<tr>
			<td style="font-size: 18px;">Your Access Issues verification code is:</td>
		</tr>
		<tr style="height: 100px;">
			<td style="margin-top: 5px; font-weight: bold; letter-spacing: 5; font-size: 30px; font-family: monospace;">${otp}
			</td>
		</tr>
		<br>
		<br>
		<br>
		<tr style="height: 50px;">
			<td>
				<p style="color: #d1d5db">If you didn't request this, you can safely ignore it.</p>
			</td>
		</tr>
	</table>
	`
}

async function execute(
  email: string,
  emailService: EmailService,
  userRepo: UserRepo,
) {
  try {
    const parsed = z.string().email().safeParse(email)
    if (!parsed.success)
      throw new AppError('OTP', 'Invalid email', {
        data: { email },
      })
    const tokenRes = await generateToken(email)
    if (tokenRes.error) throw tokenRes.error
    const otpRes = await generateOtp()
    if (otpRes.error) throw otpRes.error
    const { jwt, tokenHash } = tokenRes.data
    const { otp, otpHash } = otpRes.data
    await userRepo.setOtpTokenHash(email, tokenHash, otpHash)

    const sendRes = await emailService.send({
      to: [email],
      from: env.FROM_EMAIL,
      subject: 'Login to Access Issues',
      html: otpHtmlTemplate({ otp }),
      text: otpTextTemplate({ otp }),
    })
    if (sendRes.error)
      throw new AppError('EMAIL', 'Failed to send email', {
        data: {
          email,
          error: sendRes.error,
        },
      })
    return ok(jwt)
  } catch (error) {
    return catchToResult(error, {
      data: { email },
    })
  }
}

export function newSendOtpCmd(emailService: EmailService, userRepo: UserRepo) {
  return (email: string) => execute(email, emailService, userRepo)
}

export type SendOtpCmd = ReturnType<typeof newSendOtpCmd>
