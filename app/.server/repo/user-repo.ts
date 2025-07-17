import { and, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  AuthorizationRoleEnum,
  type AuthorizationRole,
} from '~/constants/enums/authorization-role-enum'
// import type { SessionData } from '~/constants/schemas/session-data-schema'
import { env } from '~/env'

import { AppError, catchToResult, ok } from '../../lib/result'
// import type { TableConfig } from '../lib/search-params-table'

import { db } from '~/db/db'
// import { searchParamsQuery } from '../db/query-helpers'
import { usersTable, usersToOrganizationsTable } from '../../db/schema'
import type { UuidV7 } from '~/constants/schemas/uuid-v7-schema'

// function queryFilters(session: SessionData) {
//   const filterRes = authorizationService.buildUserFilters(session)
//   if (filterRes.error) throw filterRes.error
//   return [isNull(users.deletedAt), ...filterRes.data]
// }

// async function getTableData<RowSchema>(
//   request: Request,
//   session: SessionData,
//   tableConfig: TableConfig<RowSchema>,
// ) {
//   const baseQuery = db
//     .select({
//       id: users.id,
//       email: users.email,
//       name: users.name,
//       role: users.role,
//     })
//     .from(users)
//     .where(and(...queryFilters(session)))
//     .innerJoin(usersToOrganizations, eq(users.id, usersToOrganizations.userId))
//     .as('users_base_query')
//   const queryRes = await searchParamsQuery(baseQuery, tableConfig, request.url)
//   if (queryRes.error) throw queryRes.error
//   return {
//     table: queryRes.data,
//   }
// }

const preparedIsUserInOrganizatonQuery = db.query.usersToOrganizationsTable
  .findFirst({
    where: and(
      eq(usersToOrganizationsTable.userId, sql.placeholder('userId')),
      eq(
        usersToOrganizationsTable.organizationId,
        sql.placeholder('organizationId'),
      ),
    ),
    columns: { userId: true },
  })
  .prepare('isUserInOrganization')

async function isUserInOrganization(
  can: boolean,
  userId: UuidV7,
  organizationId: UuidV7,
) {
  if (!can) return false
  return !!(await preparedIsUserInOrganizatonQuery.execute({
    userId,
    organizationId,
  }))
}

async function byEmail(email: string) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  })
}

async function byId(id: UuidV7) {
  return await db.query.usersTable.findFirst({
    where: and(eq(usersTable.id, id)),
  })
}

async function createUser(input: { name: string; email: string }) {
  const res = await db.insert(usersTable).values(input).returning()
  if (!res[0])
    throw new AppError('DB', 'Unable to create user', {
      data: { input },
    })
  return res[0]
}

async function addUserToOrganization(input: {
  userId: UuidV7
  organizationId: UuidV7
  role: AuthorizationRole
}) {
  await db.insert(usersToOrganizationsTable).values(input)
}

async function removeUserFromOrganization(input: {
  userId: UuidV7
  organizationId: UuidV7
}) {
  await db
    .delete(usersToOrganizationsTable)
    .where(
      and(
        eq(usersToOrganizationsTable.userId, input.userId),
        eq(usersToOrganizationsTable.organizationId, input.organizationId),
      ),
    )
}

async function update(input: { id: UuidV7; name: string; email: string }) {
  await db.update(usersTable).set(input).where(eq(usersTable.id, input.id))
}

async function setOtpTokenHash(
  email: string,
  tokenHash: string,
  otpHash: string,
) {
  await db
    .update(usersTable)
    .set({ tokenHash, otpHash })
    .where(eq(usersTable.email, email))
}

async function remove(id: string) {
  await db.delete(usersTable).where(eq(usersTable.id, id))
}

export function newUserRepo() {
  return {
    addUserToOrganization,
    byEmail,
    byId,
    createUser,
    isUserInOrganization,
    remove,
    removeUserFromOrganization,
    setOtpTokenHash,
    update,
  }
}

export type UserRepo = ReturnType<typeof newUserRepo>
