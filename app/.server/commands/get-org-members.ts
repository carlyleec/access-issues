import { catchToResult, ok } from '~/lib/result'
import type { OrganizationRepo } from '../repo/organization-repo'

async function execute(
  organizationId: string,
  organizationRepo: OrganizationRepo,
) {
  try {
    const members = await organizationRepo.getOrganizationMembers(
      organizationId,
    )

    return ok(members)
  } catch (error) {
    return catchToResult(error, {
      data: { organizationId },
    })
  }
}

export function newGetOrgMembersCmd(organizationRepo: OrganizationRepo) {
  return (organizationSlug: string) =>
    execute(organizationSlug, organizationRepo)
}

export type GetOrgMembersCmd = ReturnType<typeof newGetOrgMembersCmd>
