import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import { z } from 'zod'
import {
  IssueTypeEnum,
  IssueSeverityEnum,
  IssueBoltIssueTypeEnum,
  IssueAnchorIssueTypeEnum,
} from '../constants/enums/issues'
import { env } from '../env'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const auth = new JWT({
  email: env.GOOGLE_CLIENT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY,
  scopes: SCOPES,
})

const sheets = google.sheets({ version: 'v4', auth })

export class GoogleSheetsService {
  private spreadsheetId: string

  constructor(spreadsheetId: string) {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required')
    }
    this.spreadsheetId = spreadsheetId
  }

  async readRange(range: string) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      })
      return res.data.values || []
    } catch (error) {
      console.error('Error reading from Google Sheets:', error)
      throw error
    }
  }

  async writeRange(range: string, values: any[][]) {
    try {
      const res = await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      })
      return res.data
    } catch (error) {
      console.error('Error writing to Google Sheets:', error)
      throw error
    }
  }

  async appendRange(range: string, values: any[][]) {
    try {
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values },
      })
      return res.data
    } catch (error) {
      console.error('Error appending to Google Sheets:', error)
      throw error
    }
  }
}

// Column names for the report sheet
export const REPORT_SHEET_COLUMNS = [
  'Timestamp',
  'Area Name',
  'Route Name',
  'Bolt or Anchor Type',
  'Bolt Number',
  'Issue',
  'Severity',
  'Description',
  'Email Address (optional)',
  'Wall Name',
  'Resolved By',
  'notes',
  'Date (Double click cells below for Calendar)',
] as const

export interface Report {
  timestamp: string
  areaName: string
  routeName: string
  boltOrAnchorType: z.infer<typeof IssueTypeEnum>
  boltNumber: string
  issue:
    | z.infer<typeof IssueBoltIssueTypeEnum>
    | z.infer<typeof IssueAnchorIssueTypeEnum>
  severity: z.infer<typeof IssueSeverityEnum>
  description: string
  emailAddress?: string
  wallName: string
  resolvedBy?: string
  notes?: string
  date?: string
}

export class ReportSheetService extends GoogleSheetsService {
  constructor() {
    super(env.GOOGLE_SHEETS_REPORT_SHEET_ID)
  }

  async getReports(): Promise<Report[]> {
    try {
      const values = await this.readRange('A:N') // Read all columns from A to N

      if (!values || values.length === 0) {
        return []
      }

      // Skip header row and convert to Report objects
      const reports = values.slice(1).map(
        (row): Report => ({
          timestamp: row[0] || '',
          areaName: row[1] || '',
          routeName: row[2] || '',
          boltOrAnchorType: row[3] || '',
          boltNumber: row[4] || '',
          issue: row[5] || '',
          severity: row[6] || '',
          description: row[7] || '',
          emailAddress: row[8] || undefined,
          wallName: row[10] || '',
          resolvedBy: row[11] || undefined,
          notes: row[12] || undefined,
          date: row[13] || undefined,
        }),
      )

      return reports
    } catch (error) {
      console.error('Error getting reports:', error)
      throw error
    }
  }

  async addReport(report: Omit<Report, 'timestamp'>): Promise<void> {
    try {
      const timestamp = new Date().toISOString()

      const values = [
        [
          timestamp,
          report.areaName,
          report.routeName,
          report.boltOrAnchorType,
          report.boltNumber,
          report.issue,
          report.severity,
          report.description,
          report.emailAddress || '',
          report.wallName,
          report.resolvedBy || '',
          report.notes || '',
          report.date || '',
        ],
      ]

      await this.appendRange('A:N', values)
    } catch (error) {
      console.error('Error adding report:', error)
      throw error
    }
  }
}

export const reportSheetService = new ReportSheetService()
