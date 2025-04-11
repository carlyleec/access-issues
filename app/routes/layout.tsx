import { Outlet } from 'react-router'
import { Navbar } from '~/components/ui/navbar'

export default function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
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
