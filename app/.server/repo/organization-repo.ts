import { organizationsTable, usersToOrganizationsTable } from '~/db/schema'
import { db } from '~/db/db'
import { and, eq } from 'drizzle-orm'
import { catchToResult, ok } from '~/lib/result'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'

export async function listAll() {
  return await db.select().from(organizationsTable)
}

export async function bySlug(slug: string) {
  return await db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.slug, slug),
    with: {
      usersToOrganizations: true,
    },
  })
}

export async function getOrganizationRole(
  organizationId: string,
  userId: string,
) {
  return await db.query.usersToOrganizationsTable.findFirst({
    where: and(
      eq(usersToOrganizationsTable.organizationId, organizationId),
      eq(usersToOrganizationsTable.userId, userId),
    ),
  })
}

export async function getOrganizationMembers(organizationId: string) {
  const members = await db.query.usersToOrganizationsTable.findMany({
    where: eq(usersToOrganizationsTable.organizationId, organizationId),
    with: {
      user: true,
    },
  })
  return members.map((member) => ({
    ...member.user,
    role: AuthorizationRoleEnum.parse(member.role),
  }))
}

export function newOrganizationRepo() {
  return {
    bySlug,
    listAll,
    getOrganizationMembers,
    getOrganizationRole,
  }
}

export type OrganizationRepo = ReturnType<typeof newOrganizationRepo>
