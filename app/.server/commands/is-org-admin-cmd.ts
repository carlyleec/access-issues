import { env } from '~/env'
import type { EmailService } from '../services/email-service'
import { AppError, catchToResult, ok } from '~/lib/result'
import { generate as generateOtp } from '~/lib/otp'
import { generate as generateToken } from '~/lib/token'
import type { UserRepo } from '../repo/user-repo'
import { z } from 'zod'
import type { OrganizationRepo } from '../repo/organization-repo'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'

async function execute(
  organizationSlug: string,
  userId: string,
  organizationRepo: OrganizationRepo,
) {
  try {
    const organization = await organizationRepo.bySlug(organizationSlug)
    if (!organization) return ok(false)
    const organizationRole = organization.usersToOrganizations.find(
      (user) => user.userId === userId,
    )
    return ok(
      organizationRole?.role === AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN,
    )
  } catch (error) {
    return catchToResult(error, {
      data: { organizationSlug, userId },
    })
  }
}

export function newIsOrgAdminCmd(organizationRepo: OrganizationRepo) {
  return (organizationSlug: string, userId: string) =>
    execute(organizationSlug, userId, organizationRepo)
}

export type IsOrgAdminCmd = ReturnType<typeof newIsOrgAdminCmd>
