import { zodResolver } from '@hookform/resolvers/zod'
import {
  type ActionFunctionArgs,
  redirect,
  Link,
  useActionData,
  useSubmit,
} from 'react-router'
import { AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
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
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { SubmitButton } from '~/components/ui/submit-button'
import Transition from '~/components/ui/transition'
import { app } from '~/.server/app'
import useJsonSubmit from '~/components/hooks/use-json-submit'

const EmailSchema = z.object({
  email: z.string().trim().email(),
})

type Email = z.infer<typeof EmailSchema>

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json()
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const parsed = EmailSchema.safeParse(body)
  if (!parsed.success) return { message: 'Invalid email' }
  const sendOtpRes = await app.sendOtp(parsed.data.email)
  if (sendOtpRes.error) return { message: 'Unable to send verification code.' }
  const token = sendOtpRes.data
  return redirect(
    `/login/${token}?redirectTo=${searchParams.get('redirectTo') ?? '/'}`,
  )
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

export default function LoginPage() {
  const actionData = useActionData<{ message: string }>()
  const submit = useJsonSubmit()
  const form = useForm<Email>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: Email) => submit(data)

  const rootError = actionData ? actionData : form.formState.errors.root

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col justify-center">
      <Transition>
        <div className="flex w-full flex-col items-center justify-center">
          <Card className="w-[320px] md:w-[400px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Please enter your email and we will send you a verification code
                to verify your account.
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
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="me@example.com"
                              />
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
                    <SubmitButton
                      title="Send Verification Code"
                      className="w-full"
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </div>
  )
}
