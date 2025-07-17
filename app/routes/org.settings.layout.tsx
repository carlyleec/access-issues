import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
} from 'react-router'
// import { app } from '~/.server/app'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'

function NavLink({
  to,
  title,
  pathname,
}: {
  to: string
  title: string
  pathname: string
}) {
  const isActive = pathname === to
  return (
    <Link
      to={to}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'w-full justify-start transition-all duration-500',
        isActive
          ? 'text-foreground'
          : 'text-foreground/50 hover:text-foreground',
      )}
    >
      {title}
    </Link>
  )
}

export async function loader() {
  // TODO: Load organization data and settings
}

export default function OrganizationSettingsLayout() {
  const { org } = useParams()
  const location = useLocation()

  const navigationItems = [
    { id: 'general', title: 'General', to: `/${org}/settings` },
    { id: 'members', title: 'Members', to: `/${org}/settings/members` },
    { id: 'routes', title: 'Routes', to: `/${org}/settings/routes` },
  ]

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">NRAC Settings</h1>
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 mt-8 flex-shrink-0 flex flex-col gap-4">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                title={item.title}
                pathname={location.pathname}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
