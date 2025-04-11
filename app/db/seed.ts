import { db } from './db'
import {
  areasTable,
  commentsTable,
  issuesTable,
  organizationsTable,
  tagsTable,
  usersTable,
  usersToOrganizationsTable,
} from './schema'
import { faker } from '@faker-js/faker'
const emojis = ['👍', '👎', '❤️', '😂']

const nrccAreaNames = [
  'Summersville',
  'Whipporwill',
  'Upper Meadow',
  'Lower Meadow',
  'Bridge Buttress',
  'Fern Buttress',
  'Endless Wall',
  'Beauty Mountain',
  'Kaymoor',
  'South Nuttal',
  'Cotton Top',
  'Cottom Bottom',
  'Hawksnest',
]

const cccAreaNames = [
  'Looking Glass',
  'Linville Gorge',
  'Ship Rock',
  'Grandmother Mountain',
  'Blowing Rock',
  'Corner Rock',
  'Pilot Mountain',
]

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
    }
  })
  return db.insert(usersToOrganizationsTable).values(values).returning()
}

async function createAreas(
  orgId: string,
  areaNames: string[],
  tags: Awaited<ReturnType<typeof createTags>>,
) {
  const areaTags = tags.filter((tag) => tag.type === 'area')
  const tag = areaTags[Math.floor(Math.random() * areaTags.length)]
  const values = areaNames.map((name) => ({
    name,
    description: faker.lorem.paragraph(),
    organizationId: orgId,
    imageUrl: faker.image.url(),
    tags: [tag.name],
  }))
  return db.insert(areasTable).values(values).returning()
}

async function createIssues(
  orgId: string,
  areas: Awaited<ReturnType<typeof createAreas>>,
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
    return {
      title: faker.hacker.phrase(),
      description: faker.lorem.paragraph(),
      organizationId: orgId,
      areaId,
      state: 'open',
      number: index + 1,
      createdById: userId,
      numComments: Math.floor(Math.random() * 10),
      assigneeIds: [admin.id],
      reactions: [
        {
          userId: userId2.id,
          userName: userId2.name,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          createdAt: new Date().toISOString(),
        },
      ],
      tags: [tag.name],
    }
  })
  return db.insert(issuesTable).values(values).returning()
}

async function createComments(
  issues: Awaited<ReturnType<typeof createIssues>>,
  users: Awaited<ReturnType<typeof createUsers>>,
  adminsToOrg: Awaited<ReturnType<typeof createAdminsToOrg>>,
) {
  const values = issues.flatMap((issue) => {
    const userId1 = users[Math.floor(Math.random() * users.length)].id
    const userId2 = users[Math.floor(Math.random() * users.length)].id
    const userId3 = users[Math.floor(Math.random() * users.length)]
    const adminId = adminsToOrg.filter(
      (ato) => ato.organizationId === issue.organizationId,
    )[Math.floor(Math.random() * 2)].userId
    return [
      {
        issueId: issue.id,
        organizationId: issue.organizationId,
        userId: userId1,
        body: faker.lorem.sentences(Math.floor(Math.random() * 3)),
        reactions: [
          {
            userId: userId3.id,
            userName: userId3.name,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        issueId: issue.id,
        organizationId: issue.organizationId,
        userId: userId2,
        body: faker.lorem.sentences(Math.floor(Math.random() * 3)),
        reactions: [
          {
            userId: userId3.id,
            userName: userId3.name,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        issueId: issue.id,
        organizationId: issue.organizationId,
        userId: adminId,
        body: faker.lorem.sentences(Math.floor(Math.random() * 3)),
        reactions: [
          {
            userId: userId3.id,
            userName: userId3.name,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ]
  })
  return db.insert(commentsTable).values(values).returning()
}

async function createTags(orgId: string) {
  const issueTags = [
    { name: '🧗‍♀️ general', color: '#4ade80' },
    { name: '❓ question', color: '#93c5fd' },
    { name: '🚧 safety', color: '#fdba74' },
    { name: '🛠️ bolt replacement', color: '#fca5a5' },
  ]
  const areaTags = [
    { name: '⛔ area closed', color: '#fca5a5' },
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
  const areaValues = areaTags.map((tag) => ({
    name: tag.name,
    type: 'area',
    organizationId: orgId,
    color: tag.color,
  }))
  return db
    .insert(tagsTable)
    .values([...issueValues, ...areaValues])
    .returning()
}

async function createOrganzation(
  orgName: string,
  areaNames: string[],
  users: Awaited<ReturnType<typeof createUsers>>,
) {
  const orgs = await db
    .insert(organizationsTable)
    .values({ name: orgName, slug: orgName.toLowerCase(), numIssues: 200 })
    .returning()
  const org = orgs[0]
  const admins = await createAdmins(org.name)
  const adminsToOrg = await createAdminsToOrg(org.id, admins)
  const tags = await createTags(org.id)
  const areas = await createAreas(org.id, areaNames, tags)
  const issues = await createIssues(org.id, areas, admins, users, tags)
  await createComments(issues, users, adminsToOrg)
}

async function seed() {
  console.log('Clearing existing data...')
  await db.delete(usersToOrganizationsTable)
  await db.delete(organizationsTable)
  await db.delete(usersTable)
  await db.delete(areasTable)
  await db.delete(issuesTable)
  await db.delete(commentsTable)
  await db.delete(tagsTable)
  console.log('Seeding database...')
  const users = await createUsers()
  await createOrganzation('NRAC', nrccAreaNames, users)
  await createOrganzation('CCC', cccAreaNames, users)
  console.log('Database seeded successfully!')
  return process.exit(0)
}

seed()
