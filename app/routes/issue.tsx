import type { Route } from './+types/issue'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageSquare,
  ThumbsUp,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Tag,
  MapPin,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card'
import { z } from 'zod'
import { eq, inArray } from 'drizzle-orm'
import { issueAssigneesTable, issuesTable, usersTable } from '~/db/schema'
import { db } from '~/db/db'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router'

const IssueDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  number: z.number(),
  state: z.string(),
  numUpvotes: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullable(),
  closedReason: z.string().nullable(),
  flaggedAt: z.coerce.date().nullable(),
  flaggedReason: z.string().nullable(),
  area: z.object({
    id: z.string(),
    name: z.string(),
  }),
  crag: z.object({
    id: z.string(),
    name: z.string(),
  }),
  wall: z.object({
    id: z.string(),
    name: z.string(),
  }),
  route: z.object({
    id: z.string(),
    name: z.string(),
  }),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
  }),
  closedBy: z.object({
    id: z.string(),
    name: z.string(),
  }),
  assignees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
})

export async function loader({ params }: Route.LoaderArgs) {
  const issue = await db.query.issuesTable.findFirst({
    where: eq(issuesTable.number, parseInt(params.number)),
    with: {
      area: true,
      crag: true,
      wall: true,
      route: true,
      createdBy: true,
      closedBy: true,
      assignees: {
        with: {
          user: true,
        },
      },
    },
  })
  if (!issue) {
    throw new Error('Issue not found')
  }

  return IssueDetailSchema.parse({
    ...issue,
    assignees: issue.assignees.map((assignee) => assignee.user),
  })
}

export default function IssueDetailPage() {
  const issue = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Issue Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <Badge variant={issue.state === 'open' ? 'default' : 'secondary'}>
            {issue.state === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ThumbsUp className="h-4 w-4 mr-1" />
            {issue.numUpvotes} Upvotes
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-1" />
            Flag
          </Button>
          {issue.state === 'open' ? (
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Close Issue
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <XCircle className="h-4 w-4 mr-1" />
              Reopen Issue
            </Button>
          )}
        </div>
      </div>

      {/* Issue Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>Opened by {issue.createdBy.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>
            {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Area: {issue.area.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Issue Description */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${issue.createdBy.name}`}
                  />
                  <AvatarFallback>
                    {issue.createdBy.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{issue.createdBy.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>{issue.text}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  React
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Details</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-1">Status</div>
                <Badge
                  variant={issue.state === 'open' ? 'default' : 'secondary'}
                >
                  {issue.state === 'open' ? 'Open' : 'Closed'}
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Area</div>
                <div className="text-sm">
                  {`${issue.area.name} > ${issue.crag.name} > ${issue.wall.name} > ${issue.route.name}`}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Assignees</div>
                <div className="flex flex-wrap gap-1">
                  {issue.assignees.length > 0 ? (
                    issue.assignees.map((assignee) => (
                      <Badge key={assignee.id} variant="outline">
                        {assignee.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No assignees
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Flag className="h-4 w-4 mr-2" />
                Flag Issue
              </Button>
              {issue.state === 'open' ? (
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Issue
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-start">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reopen Issue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
