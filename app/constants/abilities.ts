import type { AuthorizationRole } from '~/constants/enums/authorization-role-enum'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'

export function hasPublicUserAbilities(role: AuthorizationRole) {
  return role === AuthorizationRoleEnum.enum.PUBLIC_USER
}

export function hasOrganizationAdminAbilities(role: AuthorizationRole) {
  return role === AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN
}
