import sgMail from '@sendgrid/mail'
import { env } from '~/env'
import { catchToResult, ok, type RTP } from '~/lib/result'

export interface EmailService {
  send: (data: {
    to: string[]
    from: string
    subject: string
    text: string
    html: string
  }) => RTP<true>
}

export function newSendGridEmailService(): EmailService {
  return {
    send: async (data: {
      to: string[]
      from: string
      subject: string
      text: string
      html: string
    }) => {
      try {
        sgMail.setApiKey(env.SEND_GRID_API_KEY)
        await sgMail.send(data)
        return ok(true)
      } catch (error) {
        return catchToResult(error, {
          data: {
            to: data.to,
            from: data.from,
          },
        })
      }
    },
  }
}
