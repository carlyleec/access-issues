import { v7 as uuidv7 } from 'uuid'
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

type Reaction = {
  userId: string
  userName: string
  emoji: string
  createdAt: string
}

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
    numIssues: integer('num_issues').notNull().default(0),
    donateUrl: varchar('donate_url', { length: 256 }),
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
    issues: many(issuesTable),
    tags: many(tagsTable),
    usersToOrganizations: many(usersToOrganizationsTable),
  }),
)

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().$defaultFn(uuidv7),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
})

export const userRelations = relations(usersTable, ({ many }) => ({
  issueCreatedBy: many(issuesTable, { relationName: 'issueCreatedBy' }),
  issueClosedBy: many(issuesTable, { relationName: 'issueClosedBy' }),
  issues: many(issuesTable),
  comments: many(commentsTable),
  usersToOrganizations: many(usersToOrganizationsTable),
}))

export const usersToOrganizationsTable = pgTable(
  'users_to_organizations',
  {
    role: varchar('role', { length: 256 }),
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
    issue: one(organizationsTable, {
      fields: [usersToOrganizationsTable.organizationId],
      references: [organizationsTable.id],
      relationName: 'organization',
    }),
  }),
)

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
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ...timestamps,
  },
  (areas) => {
    return [
      index('areas_name_idx').on(areas.name),
      index('areas_organization_id_idx').on(areas.organizationId),
      index('areas_tags_idx').on(areas.tags),
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
}))

export const issuesTable = pgTable(
  'issues',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    number: integer('number').notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    description: text('description').notNull(),
    organizationId: uuid('organization_id').notNull(),
    areaId: uuid('area_id'),
    createdById: uuid('created_by_id').notNull(),
    closedAt: timestamp('closed_at', { mode: 'date' }),
    closedById: uuid('closed_by_id'),
    closedReason: varchar('closed_reason', { length: 10 }),
    state: varchar('state', { length: 10 }).notNull().default('open'),
    flaggedAt: timestamp('flagged_at', { mode: 'date' }),
    flaggedReason: timestamp('flagged_reason', { mode: 'date' }),
    numComments: integer('num_comments').notNull().default(0),
    assigneeIds: text('assignee_ids')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    reactions: jsonb('reactions').$type<Reaction[]>(),
    ...timestamps,
  },
  (issues) => {
    return [
      index('issues_number_idx').on(issues.number),
      index('issues_title_idx').on(issues.title),
      index('issues_state_idx').on(issues.state),
      index('issues_area_id_idx').on(issues.areaId),
      index('issues_organization_id_idx').on(issues.organizationId),
      index('issues_tags_idx').on(issues.tags),
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
  organization: one(organizationsTable, {
    fields: [issuesTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  comments: many(commentsTable),
}))

export const commentsTable = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    body: text('body').notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issuesTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    reactions: jsonb('reactions').$type<Reaction[]>(),
    flaggedAt: timestamp('flagged_at', { mode: 'date' }),
    flaggedReason: timestamp('flagged_reason', { mode: 'date' }),
    ...timestamps,
  },
  (comments) => {
    return [
      index('comments_organization_id_idx').on(comments.organizationId),
      index('comments_issue_id_idx').on(comments.issueId),
      index('comments_user_id_idx').on(comments.userId),
      index('comments_created_at_idx').on(comments.createdAt),
    ]
  },
)

export const commentRelations = relations(commentsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [commentsTable.organizationId],
    references: [organizationsTable.id],
    relationName: 'organization',
  }),
  issue: one(issuesTable, {
    fields: [commentsTable.issueId],
    references: [issuesTable.id],
    relationName: 'issue',
  }),
  commenter: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
    relationName: 'commenter',
  }),
}))

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
