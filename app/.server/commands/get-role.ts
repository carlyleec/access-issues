import { catchToResult, ok } from '~/lib/result'
import type { OrganizationRepo } from '../repo/organization-repo'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'

async function execute(
  organizationSlug: string,
  userId: string,
  organizationRepo: OrganizationRepo,
) {
  try {
    const organization = await organizationRepo.bySlug(organizationSlug)
    if (!organization) return ok(AuthorizationRoleEnum.enum.PUBLIC_USER)
    const organizationRole = organization.usersToOrganizations.find(
      (user) => user.userId === userId,
    )
    const parsed = AuthorizationRoleEnum.safeParse(organizationRole?.role)
    const role = parsed.success
      ? parsed.data
      : AuthorizationRoleEnum.enum.PUBLIC_USER

    return ok(role)
  } catch (error) {
    return catchToResult(error, {
      data: { organizationSlug, userId },
    })
  }
}

export function newGetRoleCmd(organizationRepo: OrganizationRepo) {
  return (organizationSlug: string, userId: string) =>
    execute(organizationSlug, userId, organizationRepo)
}

export type GetRoleCmd = ReturnType<typeof newGetRoleCmd>
