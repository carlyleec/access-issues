import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type ShouldRevalidateFunctionArgs,
} from 'react-router'
import { Navbar } from '~/components/ui/navbar'
import { app } from '~/.server/app'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'
import { Toaster } from '~/components/ui/sonner'

export function shouldRevalidate({
  currentParams,
  nextParams,
}: ShouldRevalidateFunctionArgs) {
  // Revalidate when the org parameter changes
  return currentParams.org !== nextParams.org
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return app.session.withSession(request, async (session) => {
    const orgsRes = await app.listAllOrgs()
    const orgs = orgsRes.error ? [] : orgsRes.data
    const orgSlug = params.org

    if (!orgSlug) {
      return {
        isLoggedIn: !!session,
        currentOrganization: null,
        organizations: orgs,
        role: AuthorizationRoleEnum.enum.PUBLIC_USER,
      }
    }
    const orgRes = await app.getOrg(orgSlug)
    const org = orgRes.error ? null : orgRes.data

    if (!session) {
      return {
        isLoggedIn: false,
        currentOrganization: org,
        organizations: orgs,
        role: AuthorizationRoleEnum.enum.PUBLIC_USER,
      }
    }

    const roleRes = await app.getRole(orgSlug, session.userId)
    if (roleRes.error)
      return {
        isLoggedIn: !!session,
        currentOrganization: org,
        organizations: orgs,
        role: AuthorizationRoleEnum.enum.PUBLIC_USER,
      }

    return {
      isLoggedIn: !!session,
      currentOrganization: org,
      organizations: orgs,
      role: roleRes.data,
    }
  })
}

export default function Layout() {
  const { isLoggedIn, role, currentOrganization, organizations } =
    useLoaderData<typeof loader>()

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        currentOrganization={currentOrganization}
        organizations={organizations}
        role={role}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
      <footer className="border-t py-6 md:py-0 flex items-center justify-center">
        <div className="container flex flex-row items-center justify-center gap-4 md:h-24 ">
          <div className="flex flex-row justify-center items-center gap-4 px-8 md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by climbers for climbers. Help maintain access to our
              climbing areas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
