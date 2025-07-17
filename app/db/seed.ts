import { db } from './db'
import {
  areasTable,
  cragsTable,
  issuesTable,
  organizationsTable,
  routesTable,
  tagsTable,
  usersTable,
  usersToOrganizationsTable,
  wallsTable,
} from './schema'
import { faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import seedRoutes from './seeds/seed-routes'
import {
  IssueBoltIssueTypeEnum,
  IssueSeverityEnum,
  IssueTypeEnum,
} from '~/constants/enums/issues'
import { RouteBoltTypeEnum } from '~/constants/enums/routes'
import { AuthorizationRoleEnum } from '~/constants/enums/authorization-role-enum'
const emojis = ['👍', '👎', '❤️', '😂']

async function createAdmins(orgName: string) {
  const values = [1, 2].map((num) => ({
    name: `${orgName} Admin ${num}`,
    email: `carlyleec+${orgName.toLowerCase()}_admin${num}`,
  }))

  return db.insert(usersTable).values(values).returning()
}

async function createUsers() {
  const values = [1, 2, 3, 4].map((num) => ({
    email: `carlyleec+${num}@gmail.com`,
    name: `User ${num}`,
  }))
  return db.insert(usersTable).values(values).returning()
}

async function createAdminsToOrg(
  orgId: string,
  admins: Awaited<ReturnType<typeof createAdmins>>,
) {
  const values = admins.map((admin) => {
    return {
      organizationId: orgId,
      userId: admin.id,
      role: AuthorizationRoleEnum.enum.ORGANIZATION_ADMIN,
    }
  })
  return db.insert(usersToOrganizationsTable).values(values).returning()
}

async function createIssues(
  orgId: string,
  areas: Awaited<ReturnType<typeof getAreas>>,
  crags: Awaited<ReturnType<typeof getCrags>>,
  walls: Awaited<ReturnType<typeof getWalls>>,
  routes: Awaited<ReturnType<typeof getRoutes>>,
  admins: Awaited<ReturnType<typeof createAdmins>>,
  users: Awaited<ReturnType<typeof createUsers>>,
  tags: Awaited<ReturnType<typeof createTags>>,
) {
  const values = Array.from(Array(100)).map((_x, index) => {
    const issuesTags = tags.filter((tag) => tag.type === 'issue')
    const tag = issuesTags[Math.floor(Math.random() * issuesTags.length)]
    const userId = users[Math.floor(Math.random() * users.length)].id
    const userId2 = users[Math.floor(Math.random() * users.length)]
    const admin = admins[Math.floor(Math.random() * admins.length)]
    const areaId = areas[Math.floor(Math.random() * areas.length)].id
    const cragsInArea = crags.filter((crag) => crag.areaId === areaId)
    const cragId =
      cragsInArea[Math.floor(Math.random() * cragsInArea.length)].id
    const wallsInCrag = walls.filter((wall) => wall.cragId === cragId)
    const wallId =
      wallsInCrag[Math.floor(Math.random() * wallsInCrag.length)].id
    const routesInCrag = routes.filter((route) => route.wallId === wallId)
    const routeId =
      routesInCrag[Math.floor(Math.random() * routesInCrag.length)].id
    const severities = Object.values(IssueSeverityEnum.Values)
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const boltTypes = Object.values(RouteBoltTypeEnum.Values)
    const boltType = boltTypes[Math.floor(Math.random() * boltTypes.length)]
    const types = Object.values(IssueTypeEnum.Values)
    const type = types[Math.floor(Math.random() * types.length)]
    const boltIssues = Object.values(IssueBoltIssueTypeEnum.Values)
    const boltIssue = boltIssues[Math.floor(Math.random() * boltIssues.length)]
    return {
      number: index + 1,
      type,
      title: faker.hacker.phrase(),
      text: faker.lorem.paragraph(),
      severity,
      boltOrAnchor: 'bolt',
      organizationId: orgId,
      boltNumber: Math.floor(Math.random() * 12),
      boltIssue,
      areaId,
      cragId,
      wallId,
      routeId,
      state: 'open',
      createdById: userId,
      boltType,
      numUpvotes: 0,
      assigneeIds: [admin.id],
      tags: [tag.name],
    }
  })
  return db.insert(issuesTable).values(values).returning()
}

async function createTags(orgId: string) {
  const issueTags = [
    { name: '🧗‍♀️ general', color: '#4ade80' },
    { name: '❓ question', color: '#93c5fd' },
    { name: '🚧 safety', color: '#fdba74' },
    { name: '🛠️ bolt replacement', color: '#fca5a5' },
  ]
  const cragTags = [
    { name: '⛔ crag closed', color: '#fca5a5' },
    { name: '🟨 sensitive access', color: '#fdba74' },
    { name: '🟢 no access issues', color: '#4ade80' },
    { name: '🚗 limited parking', color: '#d8b4fe' },
    { name: '🏠 private property', color: '#f9a8d4' },
  ]
  const issueValues = issueTags.map((tag) => ({
    name: tag.name,
    type: 'issue',
    organizationId: orgId,
    color: tag.color,
  }))
  const cragValues = cragTags.map((tag) => ({
    name: tag.name,
    type: 'crag',
    organizationId: orgId,
    color: tag.color,
  }))
  return db
    .insert(tagsTable)
    .values([...issueValues, ...cragValues])
    .returning()
}

async function getAreas(orgId: string) {
  return db
    .select()
    .from(areasTable)
    .where(eq(areasTable.organizationId, orgId))
}

async function getCrags(orgId: string) {
  return db
    .select()
    .from(cragsTable)
    .where(eq(cragsTable.organizationId, orgId))
}

async function getWalls(orgId: string) {
  return db
    .select()
    .from(wallsTable)
    .where(eq(wallsTable.organizationId, orgId))
}

async function getRoutes(orgId: string) {
  return db
    .select()
    .from(routesTable)
    .where(eq(routesTable.organizationId, orgId))
}

async function createOrganzation(
  orgName: string,
  users: Awaited<ReturnType<typeof createUsers>>,
) {
  const description =
    'We exists to preserve and promote access to climbing areas, and to conserve climbing resources in the New River Gorge and surrounding areas'
  const orgs = await db
    .insert(organizationsTable)
    .values({
      name: orgName,
      slug: orgName.toLowerCase(),
      description,
      logoUrl:
        'https://www.newriverclimbing.net/uploads/1/0/9/8/109883188/nrac-main-black-transparent.jpg',
    })
    .returning()
  const org = orgs[0]
  const admins = await createAdmins(org.name)
  await createAdminsToOrg(org.id, admins)
  const tags = await createTags(org.id)
  await seedRoutes(org.id)
  const areas = await getAreas(org.id)
  const crags = await getCrags(org.id)
  const walls = await getWalls(org.id)
  const routes = await getRoutes(org.id)
  await createIssues(org.id, areas, crags, walls, routes, admins, users, tags)
}

async function deleteAllData() {
  await db.delete(usersToOrganizationsTable)
  await db.delete(organizationsTable)
  await db.delete(usersTable)
  await db.delete(areasTable)
  await db.delete(issuesTable)
  await db.delete(tagsTable)
}

async function seed() {
  console.log('Clearing existing data...')
  await deleteAllData()
  console.log('Seeding database...')
  const users = await createUsers()
  await createOrganzation('NRAC', users)
  console.log('Database seeded successfully!')
  return process.exit(0)
}

seed()
