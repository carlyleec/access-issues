import { z } from 'zod'

export const IssueStateEnum = z.enum(['open', 'closed'])
export type IssueState = z.infer<typeof IssueStateEnum>

export const IssueTypeEnum = z.enum(['bolt', 'anchor', 'other'])
export type IssueType = z.infer<typeof IssueTypeEnum>

export const IssueActionTypeEnum = z.enum([
  'comment',
  'validate',
  'reopen',
  'close',
  'assign',
  'unassign',
  'reassign',
  'reference',
  'unreference',
  'tag',
  'untag',
])

export type IssueActionType = z.infer<typeof IssueActionTypeEnum>

export const IssueSeverityEnum = z.enum(['1', '2', '3', '4', '5'])
export type IssueSeverity = z.infer<typeof IssueSeverityEnum>

export const IssueBoltIssueTypeEnum = z.enum([
  'Spinner',
  'Worn',
  'Missing',
  'Rusted',
  'Placement',
  'Other',
])

export type IssueBoltIssueType = z.infer<typeof IssueBoltIssueTypeEnum>

export const IssueAnchorIssueTypeEnum = z.enum([
  'Spinner',
  'Worn',
  'Missing',
  'Rusted',
  'Placement',
  'Other',
])

export type IssueAnchorIssueType = z.infer<typeof IssueAnchorIssueTypeEnum>
