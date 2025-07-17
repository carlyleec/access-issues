import { z } from 'zod'
import { hasOrganizationAdminAbilities } from '~/constants/abilities'
import {
  AuthorizationRoleEnum,
  type AuthorizationRole,
} from '~/constants/enums/authorization-role-enum'
import { UuidV7Schema, type UuidV7 } from '~/constants/schemas/uuid-v7-schema'
import { authorizationResult } from '~/lib/authorization-result'
import { AppError, catchToResult, ok } from '~/lib/result'
import type { UserRepo } from '~/.server/repo/user-repo'
import type { InviteUserCmd } from './invite-user-cmd'
import { SessionDataSchema, type SessionData } from '../session'
import type { OrganizationRepo } from '../repo/organization-repo'

function canRemoveOrgMember(
  role: AuthorizationRole | undefined,
  organizationId: UuidV7,
) {
  return authorizationResult(
    role ? hasOrganizationAdminAbilities(role) : false,
    'You do not have permission to remove organization members.',
    {
      data: {
        role,
        organizationId,
      },
    },
  )
}

const RemoveOrgMemberInputSchema = z.object({
  userId: UuidV7Schema,
  organizationSlug: z
    .string()
    .min(1, { message: 'Organization slug is required' }),
  session: SessionDataSchema,
})

type RemoveOrgMemberInput = z.infer<typeof RemoveOrgMemberInputSchema>

async function execute(
  input: RemoveOrgMemberInput,
  organizationRepo: OrganizationRepo,
  userRepo: UserRepo,
) {
  try {
    const parsedInput = RemoveOrgMemberInputSchema.safeParse(input)
    if (!parsedInput.success)
      throw new AppError('VALIDATION', 'Invalid inputs', {
        issues: parsedInput.error.issues,
        data: input,
      })
    const organization = await organizationRepo.bySlug(
      parsedInput.data.organizationSlug,
    )
    if (!organization)
      throw new AppError('AUTHORIZATION', 'Organization not found', {
        data: { input },
      })
    const organizationRole = organization.usersToOrganizations.find(
      (user) => user.userId === parsedInput.data.session.userId,
    )
    const parsedRole = AuthorizationRoleEnum.safeParse(organizationRole?.role)
    const role = parsedRole.success ? parsedRole.data : undefined
    const authRes = canRemoveOrgMember(role, organization.id)
    if (authRes.error) throw authRes.error
    const parsed = RemoveOrgMemberInputSchema.safeParse(input)
    if (parsed.error)
      throw new AppError('VALIDATION', 'Invalid inputs', {
        issues: parsed.error.issues,
        data: input,
      })
    await userRepo.removeUserFromOrganization({
      userId: input.userId,
      organizationId: organization.id,
    })
    return ok(true as const)
  } catch (error) {
    return catchToResult(error, {
      data: { input },
    })
  }
}

export function newRemoveOrgMemberCmd(
  organizationRepo: OrganizationRepo,
  userRepo: UserRepo,
) {
  return (input: RemoveOrgMemberInput) =>
    execute(input, organizationRepo, userRepo)
}

export type RemoveOrgMemberCmd = ReturnType<typeof newRemoveOrgMemberCmd>
