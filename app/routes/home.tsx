import type { Route } from './+types/home'
import { Button } from '~/components/ui/button'
import { ArrowRight, MapPin, AlertTriangle, Building2 } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { app } from '~/.server/app'
import { Card, CardTitle, CardHeader, CardContent } from '~/components/ui/card'
import { Navbar } from '~/components/ui/navbar'
import { useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Access Issues' },
    {
      name: 'description',
      content:
        'Report and track access issues to help maintain climbing areas for future generations',
    },
  ]
}

export async function loader() {
  const organizations = await app.listAllOrgs()
  if (organizations.error) {
    return {
      organizations: [],
    }
  }
  return { organizations: organizations.data }
}

export default function HomePage() {
  const { organizations } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search organizations..." />
        <CommandList>
          <CommandEmpty>No organization found.</CommandEmpty>
          <CommandGroup heading="Organizations">
            {organizations.map((organization) => (
              <CommandItem
                key={organization.id}
                onSelect={() => {
                  setOpen(false)
                  window.location.href = `/${organization.slug}`
                }}
              >
                <Link
                  to={`/${organization.slug}`}
                  className="w-full flex justify-center items-center"
                >
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="flex items-center gap-2 w-full">
                      {organization.logoUrl && (
                        <img
                          src={organization.logoUrl}
                          alt={organization.name}
                          className="h-4  mr-2"
                        />
                      )}
                      <span>{organization.name}</span>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {organization.description}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center">
        {/* Hero Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=2400&auto=format&fit=crop"
            alt="Rock climber on a cliff face"
            className="w-full h-full object-cover brightness-50"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-xl md:text-3xl mb-8 max-w-2xl mx-auto">
            Report and track safety and access issues with your local climbing
            organization
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="text-lg"
            variant="secondary"
          >
            Find my organization
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report Issues</h3>
              <p className="text-muted-foreground">
                Document access issues, bolt and anchor replacement needs, and
                safety concerns in your climbing areas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Areas</h3>
              <p className="text-muted-foreground">
                Stay informed about the status of climbing areas and ongoing
                access and maintenance efforts
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Take Action</h3>
              <p className="text-muted-foreground">
                Get involved in maintaining and protecting climbing access in
                your community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Help?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the community of climbers working to maintain access to our
            favorite climbing areas
          </p>
        </div>
      </div>
    </div>
  )
}
