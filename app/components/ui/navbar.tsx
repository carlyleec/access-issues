import { Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { AlertTriangle, MapPin } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full flex justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 justify-between items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            Access Issues
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/areas"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Areas
            </Link>
            <Link
              to="/issues"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Issues
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild size="sm">
            <Link to="/issues/create">Create Issue</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
