import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { MapPin, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

// Mock data for demonstration
const mockAreas = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'North Face',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'The main climbing area on the north side of the mountain. Several access issues have been reported regarding parking and trail maintenance.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['parking', 'trail', 'access'],
    createdAt: new Date('2023-01-15T10:30:00Z'),
    updatedAt: new Date('2023-05-16T14:45:00Z'),
    numIssues: 5,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'South Wall',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Popular bouldering area with multiple access concerns. Landowner relations need improvement and some routes may be affected by seasonal closures.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['landowner', 'seasonal', 'bouldering'],
    createdAt: new Date('2023-02-20T09:15:00Z'),
    updatedAt: new Date('2023-05-10T11:30:00Z'),
    numIssues: 3,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'East Ridge',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Remote climbing area with challenging access. Road conditions are poor and signage is inadequate. Several bolts need replacement.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['road', 'signage', 'hardware'],
    createdAt: new Date('2023-03-05T14:20:00Z'),
    updatedAt: new Date('2023-05-18T09:45:00Z'),
    numIssues: 7,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    name: 'West Valley',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Family-friendly climbing area with multiple access points. Recent development has created parking issues and some routes may be affected by construction.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['parking', 'development', 'family'],
    createdAt: new Date('2023-04-10T11:45:00Z'),
    updatedAt: new Date('2023-05-12T16:30:00Z'),
    numIssues: 4,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174006',
    name: 'Central Crags',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Historic climbing area with significant access challenges. Land management policies are restrictive and some traditional routes may be closed.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['historic', 'policy', 'restricted'],
    createdAt: new Date('2023-05-01T09:30:00Z'),
    updatedAt: new Date('2023-05-15T13:20:00Z'),
    numIssues: 6,
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174007',
    name: 'Hidden Gorge',
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    description:
      'Secluded climbing area with unique access requirements. Seasonal river crossings and wildlife concerns affect accessibility. Some anchors need inspection.',
    imageUrl:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    tags: ['seasonal', 'wildlife', 'anchors'],
    createdAt: new Date('2023-05-10T15:45:00Z'),
    updatedAt: new Date('2023-05-17T10:15:00Z'),
    numIssues: 2,
  },
]

export default function AreasPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Access Issues Tracker</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Track and manage climbing area access issues to help maintain and
          improve access to climbing areas.
        </p>
      </div>

      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Climbing Areas</h2>
        </div>
        <Button asChild>
          <Link to="/issues/create">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report an Issue
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAreas.map((area) => (
          <Card key={area.id} className="overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden">
              <img
                src={area.imageUrl}
                alt={area.name}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{area.name}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {area.numIssues} {area.numIssues === 1 ? 'Issue' : 'Issues'}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-2">
                {area.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex flex-wrap gap-1">
                {area.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/areas/${area.id}`}>
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
