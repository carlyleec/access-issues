import { Link, useLoaderData, useParams } from 'react-router'
// import { app } from '~/.server/app'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
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
import { Textarea } from '~/components/ui/textarea'

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

export default function OrganizationSettingsPage() {
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
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input id="name" defaultValue={data.organization.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input id="slug" defaultValue={data.organization.slug} />
            <p className="text-xs text-muted-foreground">
              This is used in your organization's URL.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              defaultValue={data.organization.description}
            />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
