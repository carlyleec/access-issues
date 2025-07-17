import { z } from 'zod'

export const RouteTypeEnum = z.enum([
  'Boulder',
  'Mixed',
  'Sport',
  'Top Rope',
  'Trad',
  'Unknown',
])
export type RouteType = z.infer<typeof RouteTypeEnum>

export const BoulderRouteTypeEnum = z.enum(['V', 'Font'])
export type BoulderRouteType = z.infer<typeof BoulderRouteTypeEnum>

export const VBoulderGradeEnum = z.enum([
  'V0',
  'V1',
  'V2',
  'V3',
  'V4',
  'V5',
  'V6',
  'V7',
  'V8',
  'V9',
  'V10',
  'V11',
  'V12',
  'V13',
  'V14',
  'V15',
  'V16',
  'V17',
])

export type VBoulderGrade = z.infer<typeof VBoulderGradeEnum>

export const FontBoulderGradeEnum = z.enum([
  '3',
  '4',
  '5',
  '6a',
  '6a+',
  '6b',
  '6b+',
  '6c',
  '6c+',
  '7a',
  '7a+',
  '7b',
  '7b+',
  '7c',
  '7c+',
  '8a',
  '8a+',
  '8b',
  '8b+',
  '8c',
  '8c+',
  '9a',
])

export type FontBoulderGrade = z.infer<typeof FontBoulderGradeEnum>

export const YDSGradeEnum = z.enum([
  '5.4',
  '5.5',
  '5.6',
  '5.7',
  '5.8',
  '5.9',
  '5.10a',
  '5.10b',
  '5.10c',
  '5.11a',
  '5.11b',
  '5.11c',
  '5.11d',
  '5.12a',
  '5.12b',
  '5.12c',
  '5.12d',
  '5.13a',
  '5.13b',
  '5.13c',
  '5.13d',
  '5.14a',
  '5.14b',
  '5.14c',
  '5.14d',
  '5.15a',
  '5.15b',
  '5.15c',
  '5.15d',
])

export type YDSGrade = z.infer<typeof YDSGradeEnum>

export const FrenchGradeEnum = z.enum([
  '4a',
  '4b',
  '4c',
  '5a',
  '5b',
  '5c',
  '6a',
  '6a+',
  '6b',
  '6b+',
  '6c',
  '6c+',
  '7a',
  '7a+',
  '7b',
  '7b+',
  '7c',
  '7c+',
  '8a',
  '8a+',
  '8b',
  '8b+',
  '8c',
  '8c+',
  '9a',
  '9b',
  '9c',
])

export type FrenchGrade = z.infer<typeof FrenchGradeEnum>

export const RouteGradeEnum = z.union([
  VBoulderGradeEnum,
  FontBoulderGradeEnum,
  YDSGradeEnum,
  FrenchGradeEnum,
  z.literal('Unknown'),
])

export type RouteGrade = z.infer<typeof RouteGradeEnum>

export const RouteBoltTypeEnum = z.enum([
  '5 Piece and Hanger',
  'Stud Bolt and Hanger',
  'Glue In',
  'Other',
])

export type RouteBoltType = z.infer<typeof RouteBoltTypeEnum>

export const RouteAnchorTypeEnum = z.enum(['Cold Shuts', 'Other'])

export type RouteAnchorType = z.infer<typeof RouteAnchorTypeEnum>
