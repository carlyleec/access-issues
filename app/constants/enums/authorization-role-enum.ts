import { z } from 'zod'

export const AuthorizationRoleEnum = z.enum([
  'PUBLIC_USER',
  'ORGANIZATION_ADMIN',
])
export type AuthorizationRole = z.infer<typeof AuthorizationRoleEnum>
