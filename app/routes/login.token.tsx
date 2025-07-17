import { zodResolver } from '@hookform/resolvers/zod'
import type { ActionFunctionArgs } from 'react-router'
import { Link, useActionData, useParams } from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { redirect } from 'react-router'
import { z } from 'zod'
import { app } from '~/.server/app'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import useJsonSubmit from '~/components/hooks/use-json-submit'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp'
import { SubmitButton } from '~/components/ui/submit-button'
import Transition from '~/components/ui/transition'

const OtpCredentialsSchema = z.object({
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
  token: z.string().trim(),
})

type OtpCredentials = z.infer<typeof OtpCredentialsSchema>

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json()
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const parsed = OtpCredentialsSchema.safeParse(body)
  if (parsed.error)
    return {
      message: 'Invalid OTP',
    }
  const authenticateRes = await app.authenticate(
    parsed.data.token,
    parsed.data.otp,
  )
  if (authenticateRes.error) return { message: 'Invalid OTP' }
  const cookie = await app.session.set(authenticateRes.data)
  const path = searchParams.get('redirectTo') ?? '/'
  return redirect(path, {
    headers: {
      'Set-Cookie': cookie,
    },
  })
}

export function ErrorBoundary() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col justify-center">
      <Transition>
        <div className="flex w-full flex-col items-center justify-center">
          <Card className="p-8 sm:w-[320px] md:w-[400px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Please enter your email and we will send you a verification code
                to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[200px] flex-col items-center justify-between space-y-1">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An unexpected error occurred.
                </AlertDescription>
              </Alert>
              <Link to="/login">Try Again</Link>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </div>
  )
}

export default function LoginTokenPage() {
  const actionData = useActionData<{ message: string }>()
  const submit = useJsonSubmit()
  const params = useParams()
  const form = useForm<OtpCredentials>({
    resolver: zodResolver(OtpCredentialsSchema),
    defaultValues: { otp: '', token: params.token },
  })

  const onSubmit = async (data: OtpCredentials) => submit(data)

  const rootError = actionData ? actionData : form.formState.errors.root
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col justify-center">
      <Transition>
        <div className="flex w-full flex-col items-center justify-center">
          <Card className="w-[320px] md:w-[400px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                We sent you an email with your verification code.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[200px] flex-col justify-between space-y-2">
              <Form {...form}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    await form.handleSubmit(onSubmit)(e)
                  }}
                  className="flex flex-1 flex-col"
                >
                  <div className="grid flex-1 grow items-center gap-2">
                    <div className="grid justify-center gap-2">
                      <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <InputOTP maxLength={6} {...field}>
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid h-[40px] gap-2">
                    {rootError && (
                      <FormMessage>{rootError.message}</FormMessage>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <SubmitButton title="Submit" className="w-full" />
                  </div>
                </form>
              </Form>
              <Link className="mt-10 text-center text-xs" to="/login">
                Resend Verification Code
              </Link>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </div>
  )
}
