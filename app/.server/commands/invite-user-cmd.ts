import { z } from 'zod'
import { env } from '~/env'
import { AppError, catchToResult, ok } from '~/lib/result'
import type { EmailService } from '~/.server/services/email-service'

export function userInviteTextTemplate(organizationName: string) {
  return `
	You've been invited to the ${organizationName} organization on Access Issues.</p>
	Click the link below to sign in</p>
	${env.SITE_URL}/login
`
}

export function userInviteHtmlTemplate(organizationName: string) {
  return `
	<table
		style="font-family: Arial, Helvetica, sans-serif; text-align: center; position: relative;  color: #111827; margin:0 auto;width:100%;max-width:400px;">
		<tr>
			<td><h1 style="font-size: 24px; font-weight: bold; color: #111827;">Access Issues</h1></td>
		</tr>
		<tr>
			<td style="font-size: 18px;">You have been invited to the ${organizationName} organization on Access Issues</td>
		</tr>
		<br>
		<tr style="height: 50px;">
			<td>
			<p> <a href="${env.SITE_URL}/login"
					style="font-size: 16px; color: #3b82f6; padding: 10px; text-align: center; display: inline-block;">
					Sign In</a>
			</p>
			</td>
		</tr>
	</table>
	`
}

const InviteUserInputSchema = z.object({
  email: z.string().email(),
  organizationName: z
    .string()
    .min(1, { message: 'Organization name is required' }),
})

async function execute(
  input: z.infer<typeof InviteUserInputSchema>,
  emailService: EmailService,
) {
  try {
    const parsed = InviteUserInputSchema.safeParse(input)
    if (parsed.error)
      throw new AppError('VALIDATION', 'Invalid inputs', {
        issues: parsed.error.issues,
        data: input,
      })

    const html = userInviteHtmlTemplate(input.organizationName)
    const text = userInviteTextTemplate(input.organizationName)
    await emailService.send({
      to: [input.email],
      from: env.FROM_EMAIL,
      subject: `You've been invited to ${input.organizationName} on Access Issues`,
      html,
      text,
    })
    return ok(true)
  } catch (error) {
    return catchToResult(error, {
      data: { input },
    })
  }
}

export function newInviteUserCmd(emailService: EmailService) {
  return (input: z.infer<typeof InviteUserInputSchema>) =>
    execute(input, emailService)
}

export type InviteUserCmd = ReturnType<typeof newInviteUserCmd>
