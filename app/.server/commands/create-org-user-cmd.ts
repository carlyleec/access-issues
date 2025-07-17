import { z } from 'zod'
import { hasOrganizationAdminAbilities } from '~/constants/abilities'
import {
  AuthorizationRoleEnum,
  type AuthorizationRole,
} from '~/constants/enums/authorization-role-enum'
import { type UuidV7 } from '~/constants/schemas/uuid-v7-schema'
import { authorizationResult } from '~/lib/authorization-result'
import { AppError, catchToResult, ok } from '~/lib/result'
import type { UserRepo } from '~/.server/repo/user-repo'
import type { InviteUserCmd } from './invite-user-cmd'
import { SessionDataSchema, type SessionData } from '../session'
import type { OrganizationRepo } from '../repo/organization-repo'

function canCreateUsers(
  role: AuthorizationRole | undefined,
  organizationId: UuidV7,
) {
  return authorizationResult(
    role ? hasOrganizationAdminAbilities(role) : false,
    'You do not have permission to create users.',
    {
      data: {
        role,
        organizationId,
      },
    },
  )
}

const CreateInputSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email(),
  organizationSlug: z
    .string()
    .min(1, { message: 'Organization slug is required' }),
  session: SessionDataSchema,
})

type CreateInput = z.infer<typeof CreateInputSchema>

async function execute(
  input: CreateInput,
  organizationRepo: OrganizationRepo,
  userRepo: UserRepo,
  inviteUserCmd: InviteUserCmd,
) {
  try {
    const organization = await organizationRepo.bySlug(input.organizationSlug)
    if (!organization)
      throw new AppError('AUTHORIZATION', 'Organization not found', {
        data: { input },
      })
    const organizationRole = organization.usersToOrganizations.find(
      (user) => user.userId === input.session.userId,
    )
    const parsedRole = AuthorizationRoleEnum.safeParse(organizationRole?.role)
    const role = parsedRole.success ? parsedRole.data : undefined
    const authRes = canCreateUsers(role, organization.id)
    if (authRes.error) throw authRes.error
    const parsed = CreateInputSchema.safeParse(input)
    if (parsed.error)
      throw new AppError('VALIDATION', 'Invalid inputs', {
        issues: parsed.error.issues,
        data: input,
      })

    // Check if user exists
    const user = await userRepo.byEmail(input.email)

    // If user does not exist, create them, and add them to the organization
    if (!user) {
      const newUser = await userRepo.createUser(input)
      const addUserRes = await userRepo.addUserToOrganization({
        userId: newUser.id,
        organizationId: organization.id,
        role: AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN,
      })
    } else {
      // If user exists, just add them to the organization
      await userRepo.addUserToOrganization({
        userId: user.id,
        organizationId: organization.id,
        role: AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN,
      })
    }

    // Invite user to Access Issues
    const inviteRes = await inviteUserCmd({
      email: input.email,
      organizationName: organization.name,
    })
    if (inviteRes.error) throw inviteRes.error

    return ok(true as const)
  } catch (error) {
    return catchToResult(error, {
      data: { input },
    })
  }
}

export function newCreateOrgUserCmd(
  organizationRepo: OrganizationRepo,
  userRepo: UserRepo,
  inviteUserCmd: InviteUserCmd,
) {
  return (input: CreateInput) =>
    execute(input, organizationRepo, userRepo, inviteUserCmd)
}

export type CreateOrgUserCmd = ReturnType<typeof newCreateOrgUserCmd>
