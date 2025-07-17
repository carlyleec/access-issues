import type { OrganizationRepo } from '~/.server/repo/organization-repo'
import { catchToResult, ok } from '~/lib/result'

export async function execute(organizationRepo: OrganizationRepo) {
  try {
    const organizations = await organizationRepo.listAll()
    return ok(organizations)
  } catch (error) {
    return catchToResult('UNEXPECTED', {
      data: {
        error,
      },
    })
  }
}

export function newListAllOrgsCmd(organizationRepo: OrganizationRepo) {
  return () => execute(organizationRepo)
}

export type ListAllOrgsCmd = ReturnType<typeof newListAllOrgsCmd>
