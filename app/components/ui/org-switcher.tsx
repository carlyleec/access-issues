import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronDown, Plus, Building2 } from 'lucide-react'
import { cn } from '~/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'

export interface Organization {
  name: string
  slug: string
  logoUrl?: string | null
}

interface OrganizationSwitcherProps {
  organizations: Organization[]
  currentOrganization: Organization | null
  onOrganizationChange?: (organization: Organization) => void
  className?: string
}

export function OrgSwitcher({
  organizations,
  currentOrganization,
  onOrganizationChange,
  className,
}: OrganizationSwitcherProps) {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  if (!currentOrganization) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button asChild variant="outline" size="sm">
          <Link to="/organizations">
            <Building2 className="w-4 h-4 mr-2" />
            Select Organization
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        open={open}
        onOpenChange={setOpen}
        value={currentOrganization.slug}
        onValueChange={(value) => {
          navigate(`/${value}`)
        }}
      >
        <SelectTrigger className="w-[240px] h-8">
          <div className="flex items-center gap-2">
            <img
              src={currentOrganization.logoUrl || undefined}
              alt={currentOrganization.name}
              className="h-5 "
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[120px] lg:max-w-[160px]">
                {currentOrganization.name}
              </span>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {organizations.map((organization) => (
              <SelectItem
                key={organization.slug}
                value={organization.slug}
                className="flex items-center gap-2"
              >
                <img
                  src={currentOrganization.logoUrl || undefined}
                  alt={currentOrganization.name}
                  className="h-5 "
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {organization.name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
