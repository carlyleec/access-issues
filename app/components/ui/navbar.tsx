import { Form, Link, useLocation } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  AuthorizationRoleEnum,
  type AuthorizationRole,
} from '~/constants/enums/authorization-role-enum'
import { cn } from '~/lib/utils'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { OrgSwitcher } from './org-switcher'
import { Separator } from './separator'
import { useState } from 'react'

function AuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <Form action="/logout" method="POST">
        <Button
          type="submit"
          className="w-full  cursor-pointer mt-8 mx-2"
          size="sm"
          variant="ghost"
        >
          Logout
        </Button>
      </Form>
    )
  }
  return (
    <Button asChild size="sm" variant="ghost" className="w-full  mt-8 mx-2">
      <Link to={'/login'}>Login</Link>
    </Button>
  )
}

function MenuSheet({
  isLoggedIn,
  currentOrganization,
  role,
}: {
  isLoggedIn: boolean
  currentOrganization: Organization | null
  role: AuthorizationRole
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="p-2 rounded-full">
            <Menu className="w-6 h-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img src="/logo.png" alt="Access Issues" className="w-5 h-5" />
              <span className="text-lg font-bold">Access Issues</span>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2">
            {currentOrganization &&
              role === AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mx-2 hover:text-foreground/80"
                  >
                    <Link
                      onClick={() => setOpen(false)}
                      to={`/${currentOrganization.slug}`}
                    >
                      {`${currentOrganization.name} Issues`}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start mx-2 hover:text-foreground/80"
                  >
                    <Link
                      onClick={() => setOpen(false)}
                      to={`/${currentOrganization.slug}/settings`}
                    >
                      {`${currentOrganization.name} Settings`}
                    </Link>
                  </Button>
                  <Separator />
                </>
              )}
            <AuthButtons isLoggedIn={isLoggedIn} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

type LinkProp = {
  title: string
  to: string
}

function NavLink({
  to,
  title,
  pathname,
}: {
  to: string
  title: string
  pathname: string
}) {
  const isActive = pathname.startsWith(to)
  return (
    <Link
      to={to}
      className={cn(
        'w-full justify-start ',
        isActive
          ? 'text-foreground'
          : 'text-foreground/50 hover:text-foreground',
      )}
    >
      {title}
    </Link>
  )
}
export interface Organization {
  name: string
  slug: string
  logoUrl?: string | null
}

export function Navbar({
  currentOrganization,
  organizations,
  isLoggedIn,
  role,
}: {
  currentOrganization: Organization | null
  organizations: Organization[]
  isLoggedIn: boolean
  role: AuthorizationRole
}) {
  return (
    <header className="sticky top-0 z-50 w-full flex justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 justify-between items-center">
        <div className="mr-4 flex">
          <Link to="/" className="hidden md:flex mx-6 items-center space-x-2">
            <img
              src="/logo.png"
              alt="Access Issues"
              className="w-[20px] h-[20px] mr-2 rounded-full"
            />
            {!currentOrganization && (
              <span className="text-sm ">Access Issues</span>
            )}
          </Link>
          <Link to="/" className="flex md:hidden mx-6 items-center space-x-2">
            <img
              src="/logo.png"
              alt="Access Issues"
              className="w-[20px] h-[20px] mr-2 rounded-full"
            />
          </Link>
          {currentOrganization && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <OrgSwitcher
                organizations={organizations}
                currentOrganization={currentOrganization}
              />
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 mr-4">
          {currentOrganization && (
            <Button asChild size="sm" className="hidden md:flex">
              <Link to={`/${currentOrganization.slug}/issues/create`}>
                Create Issue
              </Link>
            </Button>
          )}
          <MenuSheet
            isLoggedIn={isLoggedIn}
            currentOrganization={currentOrganization}
            role={role}
          />
        </div>
      </div>
    </header>
  )
}
