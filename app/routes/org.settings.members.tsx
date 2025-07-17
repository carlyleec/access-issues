import {
  Await,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { useEffect, useState } from 'react'
import {
  AuthorizationRoleEnum,
  type AuthorizationRole,
} from '~/constants/enums/authorization-role-enum'
import { app } from '~/.server/app'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import useJsonSubmit from '~/components/hooks/use-json-submit'
import { EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'

const ActionSchema = z.union([
  z.object({
    action: z.literal('invite'),
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email(),
    organizationSlug: z
      .string()
      .min(1, { message: 'Organization slug is required' }),
    role: AuthorizationRoleEnum,
  }),
  z.object({
    action: z.literal('remove-member'),
    organizationSlug: z
      .string()
      .min(1, { message: 'Organization slug is required' }),
    userId: z.string(),
  }),
])

export async function action({ request, params }: ActionFunctionArgs) {
  return app.session.authenticated(request, async (session) => {
    const data = await request.json()
    const parsed = ActionSchema.safeParse({
      ...data,
      organizationSlug: params.org,
    })
    if (!parsed.success) return { success: false, message: 'Invalid request' }
    switch (parsed.data.action) {
      case 'invite':
        const inviteRes = await app.createOrgUser({
          ...parsed.data,
          session,
        })
        if (inviteRes.error)
          return { success: false, message: 'Failed to invite user' }
        return { success: true, message: 'User invited' }
      case 'remove-member':
        const removeMemberRes = await app.removeOrgMember({
          ...parsed.data,
          session,
        })
        if (removeMemberRes.error)
          return { success: false, message: 'Failed to remove user' }
        return { success: true, message: 'User removed' }
    }
  })
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return app.session.authenticated(request, async ({ userId }) => {
    const orgSlug = params.org
    if (!orgSlug) return redirect(`/`)
    const orgRes = await app.getOrg(orgSlug)
    if (orgRes.error) return redirect(`/`)
    if (!orgRes.data) return redirect(`/`)
    const membersRes = await app.getOrgMembers(orgRes.data.id)
    const members = membersRes.error ? [] : membersRes.data
    return { members, organization: orgRes.data }
  })
}

function MemberCard({
  id,
  name,
  email,
  role,
}: {
  id: string
  name: string
  email: string
  role: AuthorizationRole
}) {
  const submit = useJsonSubmit()
  function handleRemoveMember() {
    if (window.confirm('Are you sure you want to remove this member?')) {
      submit({
        action: 'remove-member',
        userId: id,
      })
    }
  }
  return (
    <div
      key={id}
      className="flex items-center justify-between p-3 border rounded-lg"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={undefined} />
          <AvatarFallback>
            {name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="secondary">{role}</Badge>
        <Button variant="ghost" size="sm" onClick={handleRemoveMember}>
          Remove
        </Button>
      </div>
    </div>
  )
}

const InviteFormSchema = z.object({
  action: z.literal('invite'),
  organizationId: z.string(),
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email(),
  role: AuthorizationRoleEnum,
})

export default function OrganizationSettingsMembersPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const form = useForm<z.infer<typeof InviteFormSchema>>({
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      action: 'invite',
      email: '',
      role: AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN,
      organizationId: data.organization.id,
    },
  })
  const submit = useJsonSubmit()

  useEffect(() => {
    if (actionData?.success) {
      form.reset()
      toast.success(actionData.message)
    } else {
      toast.error(actionData?.message)
    }
  }, [actionData])

  function onSubmit(data: z.infer<typeof InviteFormSchema>) {
    submit(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage team members and invitations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite new members by email address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-7 gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="jane@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value={
                              AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN
                            }
                          >
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end items-end  ">
                <Button type="submit">Invite</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Separator />

            <div className="space-y-3">
              {data.members.map((member) => (
                <MemberCard
                  id={member.id}
                  name={member.name}
                  email={member.email}
                  role={member.role}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
