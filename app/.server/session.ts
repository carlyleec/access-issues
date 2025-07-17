import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from 'react-router'
import { env } from '~/env'
import { z } from 'zod'

import { UuidV7Schema } from '~/constants/schemas/uuid-v7-schema'
import { AppError, catchToResult, ok, type RTP } from '~/lib/result'

export const SessionDataSchema = z.object({
  userId: UuidV7Schema,
  email: z.string().email(),
  name: z.string(),
})

export type SessionData = z.infer<typeof SessionDataSchema>

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'shanco_session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: env.NODE_ENV === 'production',
    secrets: [env.WEB_SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export function getSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function setCookieHeaders(session: Session) {
  return {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  }
}

type Severity = 'success' | 'info' | 'error'

export function setFlashMessage(
  session: Session,
  message: string,
  severity: Severity,
  duration = 3600,
  flashKey = 'globalFlash',
  id = 'flash',
) {
  session.flash(flashKey, { message, severity, duration, id })
}

interface RedirectArgs {
  request: Request
  url: string
  severity: Severity
  message: string
  duration?: number
  flashKey?: string
  id?: string
}

export async function redirectWithFlash({
  request,
  url,
  severity,
  message,
  duration,
  flashKey,
  id = 'flash',
}: RedirectArgs) {
  const session = await getSession(request)
  setFlashMessage(session, message, severity, duration ?? 3600, flashKey, id)
  return redirect(url, await setCookieHeaders(session))
}

export async function getFlashMessage(request: Request) {
  const session = await getSession(request)
  const message = session.get('globalFlash') || null
  session.flash('globalFlash', null)
  return { message, sessionWithoutFlash: session }
}

export const getSessionData = async (request: Request): RTP<SessionData> => {
  try {
    const session = await getSession(request)
    const userId = session.get('userId')
    const role = session.get('role')
    const email = session.get('email')
    const name = session.get('name')
    const parsed = SessionDataSchema.safeParse({
      userId,
      role,
      email,
      name,
    })
    if (parsed.success) return ok(parsed.data)
    throw new AppError('Session', 'Unable to get session.', {
      data: {
        issues: parsed.error.issues,
      },
    })
  } catch (error) {
    return catchToResult(error, { data: {} })
  }
}

export async function setSession<T extends SessionData>(sessionData: T) {
  const session = await storage.getSession()
  const sessionDataKeys = Object.keys(sessionData) as (keyof T)[]
  sessionDataKeys.forEach((key) => {
    session.set(key as string, sessionData[key])
  })
  return storage.commitSession(session)
}

function redirectToLogin(request: Request) {
  const redirectTo = new URL(request.url).pathname
  const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
  return redirect(`/login?${searchParams}`)
}

export async function authenticated<T>(
  request: Request,
  callback: (session: SessionData) => Promise<T>,
) {
  try {
    const sessionResult = await getSessionData(request)
    if (sessionResult.error) throw redirectToLogin(request)
    return callback(sessionResult.data)
  } catch (error) {
    throw redirectToLogin(request)
  }
}

export async function withSession<T>(
  request: Request,
  callback: (session: SessionData | null) => Promise<T>,
) {
  const sessionResult = await getSessionData(request)
  if (sessionResult.error) return callback(null)
  return callback(sessionResult.data)
}

export async function logout(request: Request) {
  const session = await getSession(request)

  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
