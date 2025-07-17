import { v7 as uuidv7 } from 'uuid'
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import type { RouteBoltType, RouteGrade, RouteType } from '~/enums/routes'
import type { IssueBoltIssueType, IssueSeverity } from '~/enums/issues'

const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
}

export const organizationsTable = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    slug: varchar('slug', { length: 256 }).notNull(),
    description: text('description').notNull(),
    numIssues: integer('num_issues').notNull().default(0),
    donateUrl: varchar('donate_url', { length: 256 }),
    logoUrl: varchar('logo_url', { length: 256 }),
    ...timestamps,
  },
  (organizations) => {
    return [uniqueIndex('organizations_name_idx').on(organizations.name)]
  },
)

export const organizationRelations = relations(
  organizationsTable,
  ({ many }) => ({
    areas: many(areasTable),
    crags: many(cragsTable),
    walls: many(wallsTable),
    routes: many(routesTable),
    issues: many(issuesTable),
    tags: many(tagsTable),
    usersToOrganizations: many(usersToOrganizationsTable),
  }),
)

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(uuidv7),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  otpHash: varchar('otp_hash', { length: 255 }),
  tokenHash: varchar('token_hash', { length: 255 }),
  ...timestamps,
})

export const userRelations = relations(usersTable, ({ many }) => ({
  issueCreatedBy: many(issuesTable, { relationName: 'issueCreatedBy' }),
  issueClosedBy: many(issuesTable, { relationName: 'issueClosedBy' }),
  issueActions: many(issueActionsTable),
  usersToOrganizations: many(usersToOrganizationsTable),
}))

export const usersToOrganizationsTable = pgTable(
  'users_to_organizations',
  {
    role: varchar('role', { length: 256 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (usersToOrganizations) => {
    return [
      index('users_to_organizations_organization_id_idx').on(
        usersToOrganizations.organizationId,
      ),
      index('users_to_organizations_user_id_idx').on(
        usersToOrganizations.userId,
      ),
    ]
  },
)

export const usersToOrganizationsRelations = relations(
  usersToOrganizationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToOrganizationsTable.userId],
      references: [usersTable.id],
      relationName: 'user',
    }),
    organization: one(organizationsTable, {
      fields: [usersToOrganizationsTable.organizationId],
      references: [organizationsTable.id],
      relationName: 'organization',
    }),
  }),
)

export const routesTable = pgTable(
  'routes',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    grade: varchar('grade', { length: 256 }).$type<RouteGrade>().notNull(),
    wallId: uuid('wall_id')
      .notNull()
      .references(() => wallsTable.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 256 }).$type<RouteType>().notNull(),
    status: varchar('status', { length: 256 }),
    anchorType: varchar('anchor_type', { length: 256 }).notNull(),
    is2BoltAnchor: boolean('is_2_bolt_anchor').notNull().default(false),
    numBolts: integer('num_bolts').notNull().default(0),
    numPins: integer('num_pins').notNull().default(0),
    stars: integer('stars').notNull().default(0),
    boltTypes: text('bolt_types')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    lastWorkedOnAt: timestamp('last_worked_on_at', { mode: 'date' }),
    lastWorkedOnBy: uuid('last_worked_on_by').references(() => usersTable.id, {
      onDelete: 'cascade',
    }),
    ...timestamps,
  },
  (routes) => {
    return [
      index('routes_name_idx').on(routes.name),
      index('routes_organization_id_idx').on(routes.organizationId),
    ]
  },
)

export const routeRelations = relations(routesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [routesTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  wall: one(wallsTable, {
    fields: [routesTable.wallId],
    references: [wallsTable.id],
    relationName: 'wall',
  }),
  lastWorkedOnBy: one(usersTable, {
    fields: [routesTable.lastWorkedOnBy],
    references: [usersTable.id],
    relationName: 'lastWorkedOnBy',
  }),
  issues: many(issuesTable),
  taggings: many(taggingsTable),
}))

export const areasTable = pgTable(
  'areas',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    imageUrl: varchar('image_url', { length: 256 }),
    ...timestamps,
  },
  (areas) => {
    return [
      index('areas_name_idx').on(areas.name),
      index('areas_organization_id_idx').on(areas.organizationId),
    ]
  },
)

export const areaRelations = relations(areasTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [areasTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  issues: many(issuesTable),
  taggings: many(taggingsTable),
}))

export const cragsTable = pgTable(
  'crags',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    areaId: uuid('area_id')
      .notNull()
      .references(() => areasTable.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    imageUrl: varchar('image_url', { length: 256 }),
    ...timestamps,
  },
  (crags) => {
    return [
      index('crags_name_idx').on(crags.name),
      index('crags_organization_id_idx').on(crags.organizationId),
      index('crags_area_id_idx').on(crags.areaId),
    ]
  },
)

export const cragRelations = relations(cragsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [cragsTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  area: one(areasTable, {
    fields: [cragsTable.areaId],
    references: [areasTable.id],
    relationName: 'area',
  }),
  issues: many(issuesTable),
  taggings: many(taggingsTable),
}))

export const wallsTable = pgTable(
  'walls',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    cragId: uuid('crag_id')
      .notNull()
      .references(() => cragsTable.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    imageUrl: varchar('image_url', { length: 256 }),
    ...timestamps,
  },
  (walls) => {
    return [
      index('walls_name_idx').on(walls.name),
      index('walls_organization_id_idx').on(walls.organizationId),
      index('walls_crag_id_idx').on(walls.cragId),
    ]
  },
)

export const wallRelations = relations(wallsTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [wallsTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  crag: one(cragsTable, {
    fields: [wallsTable.cragId],
    references: [cragsTable.id],
    relationName: 'crag',
  }),
  issues: many(issuesTable),
  taggings: many(taggingsTable),
}))

export const issuesTable = pgTable(
  'issues',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    number: integer('number').notNull(),
    type: varchar('type', { length: 256 }).notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    text: text('text').notNull(),
    severity: varchar('severity', { length: 256 })
      .$type<IssueSeverity>()
      .notNull(),
    boltOrAnchor: varchar('bolt_or_anchor', { length: 256 }),
    boltType: varchar('bolt_type', { length: 256 }).$type<RouteBoltType>(),
    boltNumber: integer('bolt_number'),
    boltIssue: varchar('bolt_issue', {
      length: 256,
    }).$type<IssueBoltIssueType>(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    areaId: uuid('area_id').references(() => areasTable.id, {
      onDelete: 'cascade',
    }),
    cragId: uuid('crag_id').references(() => cragsTable.id, {
      onDelete: 'cascade',
    }),
    wallId: uuid('wall_id').references(() => wallsTable.id, {
      onDelete: 'cascade',
    }),
    routeId: uuid('route_id').references(() => routesTable.id, {
      onDelete: 'cascade',
    }),
    createdById: uuid('created_by_id').references(() => usersTable.id, {
      onDelete: 'cascade',
    }),
    closedAt: timestamp('closed_at', { mode: 'date' }),
    closedById: uuid('closed_by_id').references(() => usersTable.id, {
      onDelete: 'cascade',
    }),
    closedReason: varchar('closed_reason', { length: 10 }),
    state: varchar('state', { length: 10 }).notNull().default('open'),
    flaggedAt: timestamp('flagged_at', { mode: 'date' }),
    flaggedReason: timestamp('flagged_reason', { mode: 'date' }),
    numUpvotes: integer('num_upvotes').notNull().default(0),
    ...timestamps,
  },
  (issues) => {
    return [
      index('issues_number_idx').on(issues.number),
      index('issues_title_idx').on(issues.title),
      index('issues_state_idx').on(issues.state),
      index('issues_area_id_idx').on(issues.areaId),
      index('issues_crag_id_idx').on(issues.cragId),
      index('issues_wall_id_idx').on(issues.wallId),
      index('issues_organization_id_idx').on(issues.organizationId),
    ]
  },
)

export const issueRelations = relations(issuesTable, ({ one, many }) => ({
  createdBy: one(usersTable, {
    fields: [issuesTable.createdById],
    references: [usersTable.id],
    relationName: 'issueCreatedBy',
  }),
  closedBy: one(usersTable, {
    fields: [issuesTable.createdById],
    references: [usersTable.id],
    relationName: 'issueClosedBy',
  }),
  area: one(areasTable, {
    fields: [issuesTable.areaId],
    references: [areasTable.id],
    relationName: 'area',
  }),
  crag: one(cragsTable, {
    fields: [issuesTable.cragId],
    references: [cragsTable.id],
    relationName: 'crag',
  }),
  wall: one(wallsTable, {
    fields: [issuesTable.wallId],
    references: [wallsTable.id],
    relationName: 'wall',
  }),
  route: one(routesTable, {
    fields: [issuesTable.routeId],
    references: [routesTable.id],
    relationName: 'route',
  }),
  organization: one(organizationsTable, {
    fields: [issuesTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  upvotes: many(issueUpvotesTable),
  assignees: many(issueAssigneesTable),
  media: many(mediaTable),
  taggings: many(taggingsTable),
}))

export const issueUpvotesTable = pgTable('issue_upvotes', {
  issueId: uuid('issue_id')
    .notNull()
    .references(() => issuesTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const issueUpvotesRelations = relations(
  issueUpvotesTable,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issueUpvotesTable.issueId],
      references: [issuesTable.id],
      relationName: 'issue',
    }),
    user: one(usersTable, {
      fields: [issueUpvotesTable.userId],
      references: [usersTable.id],
      relationName: 'user',
    }),
  }),
)

export const issueActionsTable = pgTable(
  'issue_actions',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issuesTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    referencedIssueId: uuid('referenced_issue_id').references(
      () => issuesTable.id,
      {
        onDelete: 'cascade',
      },
    ),
    action: varchar('action', { length: 256 }).notNull(),
    text: text('text'),
    ...timestamps,
  },
  (issueActions) => {
    return [
      index('issue_actions_organization_id_idx').on(
        issueActions.organizationId,
      ),
      index('issue_actions_issue_id_idx').on(issueActions.issueId),
      index('issue_actions_user_id_idx').on(issueActions.userId),
      index('issue_actions_referenced_issue_id_idx').on(
        issueActions.referencedIssueId,
      ),
    ]
  },
)

export const issueAssigneesTable = pgTable(
  'issue_assignees',
  {
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issuesTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (issueAssignees) => {
    return [
      index('issue_assignees_issue_id_idx').on(issueAssignees.issueId),
      index('issue_assignees_user_id_idx').on(issueAssignees.userId),
      uniqueIndex('issue_assignees_issue_id_user_id_unique').on(
        issueAssignees.issueId,
        issueAssignees.userId,
      ),
      primaryKey({ columns: [issueAssignees.issueId, issueAssignees.userId] }),
    ]
  },
)

export const issueAssigneesRelations = relations(
  issueAssigneesTable,
  ({ one }) => ({
    issue: one(issuesTable, {
      fields: [issueAssigneesTable.issueId],
      references: [issuesTable.id],
      relationName: 'issue',
    }),
    user: one(usersTable, {
      fields: [issueAssigneesTable.userId],
      references: [usersTable.id],
      relationName: 'user',
    }),
  }),
)

export const mediaTable = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    contentType: varchar('content_type', { length: 256 }).notNull(),
    url: text('url').notNull(),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issuesTable.id, { onDelete: 'cascade' }),
    issueActionId: uuid('issue_action_id').references(
      () => issueActionsTable.id,
      { onDelete: 'cascade' },
    ),
    ...timestamps,
  },
  (issueMedia) => {
    return [index('issue_media_issue_id_idx').on(issueMedia.issueId)]
  },
)

export const tagsTable = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 256 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    type: varchar('type', { length: 256 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (tags) => {
    return [
      uniqueIndex('tags_name_idx').on(
        tags.name,
        tags.organizationId,
        tags.type,
      ),
      index('tags_type_idx').on(tags.type),
      index('tags_organization_id_idx').on(tags.organizationId),
    ]
  },
)

export const tagRelations = relations(tagsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [tagsTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
}))

export const taggingsTable = pgTable('taggings', {
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tagsTable.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),
  areaId: uuid('area_id')
    .notNull()
    .references(() => areasTable.id, { onDelete: 'cascade' }),
  cragId: uuid('crag_id')
    .notNull()
    .references(() => cragsTable.id, { onDelete: 'cascade' }),
  wallId: uuid('wall_id')
    .notNull()
    .references(() => wallsTable.id, { onDelete: 'cascade' }),
  issueId: uuid('issue_id')
    .notNull()
    .references(() => issuesTable.id, { onDelete: 'cascade' }),
  routeId: uuid('route_id')
    .notNull()
    .references(() => routesTable.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const taggingsRelations = relations(taggingsTable, ({ one }) => ({
  tag: one(tagsTable, {
    fields: [taggingsTable.tagId],
    references: [tagsTable.id],
    relationName: 'tag',
  }),
  organization: one(organizationsTable, {
    fields: [taggingsTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  area: one(areasTable, {
    fields: [taggingsTable.areaId],
    references: [areasTable.id],
    relationName: 'area',
  }),
  crag: one(cragsTable, {
    fields: [taggingsTable.cragId],
    references: [cragsTable.id],
    relationName: 'crag',
  }),
  wall: one(wallsTable, {
    fields: [taggingsTable.wallId],
    references: [wallsTable.id],
    relationName: 'wall',
  }),
  route: one(routesTable, {
    fields: [taggingsTable.routeId],
    references: [routesTable.id],
    relationName: 'route',
  }),
  issue: one(issuesTable, {
    fields: [taggingsTable.issueId],
    references: [issuesTable.id],
    relationName: 'issue',
  }),
}))
