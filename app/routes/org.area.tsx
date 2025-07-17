import { formatDistanceToNow } from 'date-fns'
import { MapPin, Calendar, Tag, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Link } from 'react-router'

// Mock data for demonstration
const mockArea = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  name: 'South Wall',
  organizationId: '123e4567-e89b-12d3-a456-426614174002',
  description:
    'Popular bouldering area with multiple access concerns. Landowner relations need improvement and some routes may be affected by seasonal closures. The area features several classic boulder problems and is a favorite among local climbers. Recent development in the surrounding area has led to increased traffic and parking issues.',
  imageUrl:
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
  tags: ['landowner', 'seasonal', 'bouldering'],
  createdAt: new Date('2023-02-20T09:15:00Z'),
  updatedAt: new Date('2023-05-10T11:30:00Z'),
  numIssues: 3,
  issues: [
    {
      id: '1',
      number: 42,
      title: 'Parking access restricted by new development',
      state: 'open',
      createdAt: new Date('2023-05-01T10:00:00Z'),
    },
    {
      id: '2',
      number: 43,
      title: 'Seasonal closure dates need clarification',
      state: 'open',
      createdAt: new Date('2023-05-05T14:30:00Z'),
    },
    {
      id: '3',
      number: 44,
      title: 'Landowner communication improvements needed',
      state: 'open',
      createdAt: new Date('2023-05-08T09:15:00Z'),
    },
  ],
}

export default function AreaDetailPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <MapPin className="h-4 w-4" />
          <span>Climbing Area</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{mockArea.name}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Added {formatDistanceToNow(mockArea.createdAt)} ago</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {mockArea.numIssues}{' '}
              {mockArea.numIssues === 1 ? 'Issue' : 'Issues'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="h-64 overflow-hidden">
              <img
                src={mockArea.imageUrl}
                alt={mockArea.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>About {mockArea.name}</CardTitle>
              <CardDescription>{mockArea.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockArea.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>
                Latest access issues reported for this area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockArea.issues.map((issue) => (
                  <div key={issue.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/issues/${issue.number}`}
                          className="font-medium hover:underline"
                        >
                          #{issue.number} {issue.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          Opened {formatDistanceToNow(issue.createdAt)} ago
                        </div>
                      </div>
                      <Badge
                        variant={
                          issue.state === 'open' ? 'default' : 'secondary'
                        }
                      >
                        {issue.state}
                      </Badge>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link to="/issues/create">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report New Issue
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Area Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Total Issues</div>
                  <div className="text-2xl font-bold">{mockArea.numIssues}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(mockArea.updatedAt)} ago
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
