import { catchToResult, ok } from '~/lib/result'
import type { OrganizationRepo } from '../repo/organization-repo'

async function execute(
  organizationSlug: string,
  organizationRepo: OrganizationRepo,
) {
  try {
    const org = await organizationRepo.bySlugWithRouteData(organizationSlug)
    if (!org) {
      throw new Error('Organization not found')
    }

    const data = {
      areas: org.areas.map((a) => ({
        id: a.id,
        name: a.name,
      })),
      crags: org.crags.map((c) => ({
        id: c.id,
        name: c.name,
        areaId: c.areaId,
      })),
      walls: org.walls.map((w) => ({
        id: w.id,
        name: w.name,
        cragId: w.cragId,
      })),
      routes: org.routes.map((r) => ({
        id: r.id,
        name: r.name,
        grade: r.grade,
        wallId: r.wallId,
      })),
    }
    return ok(data)
  } catch (error) {
    return catchToResult(error, {
      data: { organizationSlug },
    })
  }
}

export function newGetOrgRouteDataCmd(organizationRepo: OrganizationRepo) {
  return (organizationSlug: string) =>
    execute(organizationSlug, organizationRepo)
}

export type GetOrgRouteDataCmd = ReturnType<typeof newGetOrgRouteDataCmd>
