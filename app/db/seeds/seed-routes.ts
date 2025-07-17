import type { RouteGrade, RouteType } from '~/enums/routes'
import { db } from '../db'
import { areasTable, cragsTable, routesTable, wallsTable } from '../schema'
import { newRiverRoutes } from './new-river-routes'
import { summersvilleRoutes } from './summersville-routes'

async function seedRoutes(organizationId: string) {
  const newRiver = await db
    .insert(areasTable)
    .values({
      name: 'New River Gorge',
      organizationId: organizationId,
      description: 'New River Gorge',
      imageUrl:
        'https://www.newriverclimbing.net/uploads/1/0/9/8/109883188/35_orig.jpg',
    })
    .returning()
    .then(([newRiver]) => newRiver)

  const summersville = await db
    .insert(areasTable)
    .values({
      name: 'Summersville',
      organizationId: organizationId,
      description: 'Summersville Lake State Park',
      imageUrl:
        'https://www.newriverclimbing.net/uploads/1/0/9/8/109883188/cragginphoto_orig.jpg',
    })
    .returning()
    .then(([summersville]) => summersville)

  await seedNewRiverRoutes(organizationId, newRiver.id)
  await seedSummersvilleRoutes(organizationId, summersville.id)
}

async function seedNewRiverRoutes(organizationId: string, newRiverId: string) {
  type NewRiverSeedRoute = (typeof newRiverRoutes)[0]
  const newRiverCrags: Record<
    string,
    {
      name: string
      walls: Record<string, { name: string; routes: NewRiverSeedRoute[] }>
    }
  > = {}

  for (const route of newRiverRoutes) {
    if (!newRiverCrags[route.Area]) {
      newRiverCrags[route.Area] = {
        name: route.Area,
        walls: {
          [route.Wall]: {
            name: route.Wall,
            routes: [route],
          },
        },
      }
    }
    if (!newRiverCrags[route.Area].walls[route.Wall]) {
      newRiverCrags[route.Area].walls[route.Wall] = {
        name: route.Wall,
        routes: [route],
      }
    }
    newRiverCrags[route.Area].walls[route.Wall].routes.push(route)
  }

  for (const crag in newRiverCrags) {
    const dbCrag = await db
      .insert(cragsTable)
      .values({
        name: crag,
        organizationId: organizationId,
        areaId: newRiverId,
        description: crag,
        imageUrl: '',
      })
      .returning()
      .then(([dbCrag]) => dbCrag)

    for (const wall in newRiverCrags[crag].walls) {
      const dbWall = await db
        .insert(wallsTable)
        .values({
          name: wall,
          organizationId: organizationId,
          cragId: dbCrag.id,
          description: wall,
          imageUrl: '',
        })
        .returning()
        .then(([dbWall]) => dbWall)
      await db.insert(routesTable).values(
        newRiverCrags[crag].walls[wall].routes.map((route) => ({
          name: route.Route,
          organizationId: organizationId,
          grade: routeGrade(route.Grade),
          type: routeType(route.Type),
          numBolts: route.Bolts ? parseInt(route.Bolts) : 0,
          numPins: route.Pins ? parseInt(route.Pins) : 0,
          stars: route.Stars ? route.Stars : 0,
          wallId: dbWall.id,
          anchorType: route.is2BoltAnchor ? '2Bolt' : '1Bolt',
          is2BoltAnchor: route.is2BoltAnchor === 'Yes',
          status: route.Done ? route.Done : 'Not Done',
        })),
      )
    }
  }
}

async function seedSummersvilleRoutes(
  organizationId: string,
  summersvilleId: string,
) {
  console.log('seedSummersvilleRoutes', organizationId, summersvilleId)
  type SummersvilleSeedRoute = (typeof summersvilleRoutes)[0]
  const summersvilleCrags: Record<
    string,
    {
      name: string
      walls: Record<string, { name: string; routes: SummersvilleSeedRoute[] }>
    }
  > = {}

  for (const route of summersvilleRoutes) {
    if (!summersvilleCrags[route.Area]) {
      summersvilleCrags[route.Area] = {
        name: route.Area,
        walls: {
          [route.Wall]: {
            name: route.Wall,
            routes: [route],
          },
        },
      }
    }
    if (!summersvilleCrags[route.Area].walls[route.Wall]) {
      summersvilleCrags[route.Area].walls[route.Wall] = {
        name: route.Wall,
        routes: [route],
      }
    }
    summersvilleCrags[route.Area].walls[route.Wall].routes.push(route)
  }
  for (const crag in summersvilleCrags) {
    const dbCrag = await db
      .insert(cragsTable)
      .values({
        name: crag,
        organizationId: organizationId,
        areaId: summersvilleId,
        description: crag,
        imageUrl: '',
      })
      .returning()
      .then(([dbCrag]) => dbCrag)
    for (const wall in summersvilleCrags[crag].walls) {
      const dbWall = await db
        .insert(wallsTable)
        .values({
          name: wall,
          organizationId: organizationId,
          cragId: dbCrag.id,
          description: wall,
          imageUrl: '',
        })
        .returning()
        .then(([dbWall]) => dbWall)
      await db.insert(routesTable).values(
        summersvilleCrags[crag].walls[wall].routes.map((route) => ({
          name: route.Route,
          organizationId: organizationId,
          grade: routeGrade(route.Grade),
          type: routeType(route.Type),
          numBolts: route.Bolts ? parseInt(route.Bolts) : 0,
          numPins: route.Pins ? parseInt(route.Pins) : 0,
          stars: route.Stars ? route.Stars : 0,
          wallId: dbWall.id,
          anchorType: route.is2BoltAnchor ? '2Bolt' : '1Bolt',
          is2BoltAnchor: route.is2BoltAnchor === 'Yes',
        })),
      )
    }
  }
}

function routeGrade(grade: string): RouteGrade {
  switch (grade) {
    case '5':
      return '5.5'
    case '6':
      return '5.6'
    case '7':
      return '5.7'
    case '8':
      return '5.8'
    case '9':
      return '5.9'
    case '10a':
      return '5.10a'
    case '10b':
      return '5.10b'
    case '10c':
      return '5.10c'
    case '11a':
      return '5.11a'
    case '11b':
      return '5.11b'
    case '11c':
      return '5.11c'
    case '12a':
      return '5.12a'
    case '12b':
      return '5.12b'
    case '12c':
      return '5.12c'
    case '13a':
      return '5.13a'
    case '13b':
      return '5.13b'
    case '13c':
      return '5.13c'
    case '14a':
      return '5.14a'
    case '14b':
      return '5.14b'
    case '14c':
      return '5.14c'
    default:
      return 'Unknown'
  }
}

function routeType(type: string): RouteType {
  switch (type) {
    case 'Sport':
      return 'Sport'
    case 'Mixed':
      return 'Mixed'
    case 'Trad':
      return 'Trad'
    default:
      return 'Unknown'
  }
}

export default seedRoutes
