import { catchToResult, ok } from '~/lib/result'
import type { OrganizationRepo } from '../repo/organization-repo'

async function execute(
  organizationSlug: string,
  organizationRepo: OrganizationRepo,
) {
  try {
    const organization = await organizationRepo.bySlug(organizationSlug)
    if (!organization) return ok(null)

    return ok({
      id: organization.id,
      slug: organization.slug,
      name: organization.name,
      logoUrl: organization.logoUrl,
    })
  } catch (error) {
    return catchToResult(error, {
      data: { organizationSlug },
    })
  }
}

export function newGetOrgCmd(organizationRepo: OrganizationRepo) {
  return (organizationSlug: string) =>
    execute(organizationSlug, organizationRepo)
}

export type GetOrgCmd = ReturnType<typeof newGetOrgCmd>
