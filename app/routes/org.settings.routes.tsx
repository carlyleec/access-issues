import { Link, useLoaderData, useParams } from 'react-router'
// import { app } from '~/.server/app'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { useState } from 'react'

export async function loader() {
  // TODO: Load organization data and settings
  return {
    organization: {
      name: 'Example Organization',
      slug: 'example-org',
      description: 'A climbing organization',
      logoUrl: null,
    },
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Owner',
        avatar: null,
        twoFactorEnabled: false,
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Member',
        avatar: null,
        twoFactorEnabled: true,
      },
    ],
    routes: [
      {
        id: '1',
        name: 'Main Route',
        description: 'Primary access route',
        status: 'active',
      },
      {
        id: '2',
        name: 'Secondary Route',
        description: 'Alternative access route',
        status: 'inactive',
      },
    ],
  }
}

type SettingsSection = 'general' | 'members' | 'routes'

export default function OrganizationSettingsRoutesPage() {
  const data = useLoaderData<typeof loader>()
  const { org } = useParams()
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')

  const navigationItems = [
    { id: 'general', label: 'General', href: `/${org}/settings` },
    { id: 'members', label: 'Members', href: `/${org}/settings/members` },
    { id: 'routes', label: 'Routes', href: `/${org}/settings/routes` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comming soon...</h1>
    </div>
  )
}
