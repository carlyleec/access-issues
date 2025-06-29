import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table'
import { z } from 'zod'
import { BasicPagination } from '~/components/ui/basic-pagination'
import { Bookmark, BookmarkCheck, ThumbsUp } from 'lucide-react'
import { FacetedFilter } from '~/components/ui/faceted-filter'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { db } from '~/db/db'
import { and, eq, ilike, inArray, isNotNull } from 'drizzle-orm'
import { issuesTable, usersTable } from '~/db/schema'
import { format } from 'date-fns'
import {
  Link,
  useLoaderData,
  useSearchParams,
  type LoaderFunctionArgs,
} from 'react-router'

const IssueSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  number: z.number().int().positive(),
  state: z.enum(['open', 'closed']),
  numUpvotes: z.number().int(),
  createdById: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdByName: z.string(),
})

type Issue = z.infer<typeof IssueSchema>

const IssueFilters = z.object({
  pageIndex: z.number().int().nonnegative().default(0),
  pageSize: z.number().int().positive().default(15),
  search: z.string().optional(),
  state: z.enum(['open', 'closed']).default('open'),
  authors: z.array(z.string()).optional(),
})

type IssueFilters = z.infer<typeof IssueFilters>

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const filters = IssueFilters.parse(Object.fromEntries(searchParams.entries()))
  const authorFilter = filters.authors
    ? [inArray(issuesTable.createdById, filters.authors)]
    : []
  const searchFilter = filters.search
    ? [ilike(issuesTable.title, `%${filters.search}%`)]
    : []
  const stateFilter = filters.state
    ? [eq(issuesTable.state, filters.state)]
    : []

  const issues = await db.query.issuesTable.findMany({
    where: and(...authorFilter, ...searchFilter, ...stateFilter),
    with: {
      createdBy: true,
    },
    limit: filters.pageSize,
    offset: filters.pageIndex * filters.pageSize,
  })

  const authorOptions = await db
    .selectDistinct({ value: usersTable.id, label: usersTable.name })
    .from(issuesTable)
    .rightJoin(usersTable, eq(issuesTable.createdById, usersTable.id))
    .where(isNotNull(issuesTable.createdById))

  // Count the number of issues that are not the current state
  const otherCount = await db.$count(
    issuesTable,
    and(
      ...authorFilter,
      ...searchFilter,
      eq(issuesTable.state, filters.state === 'open' ? 'closed' : 'open'),
    ),
  )

  const totalCount = await db.$count(
    issuesTable,
    and(...authorFilter, ...searchFilter, ...stateFilter),
  )

  const rows = issues.map((i) => ({
    ...i,
    createdByName: i.createdBy?.name ?? '',
  }))

  return {
    totalCount,
    rows,
    openCount: filters.state === 'open' ? totalCount : otherCount,
    closedCount: filters.state === 'closed' ? totalCount : otherCount,
    authorOptions,
  }
}

function IssuesTable({
  rows,
  tags,
}: {
  rows: Issue[]
  tags: { name: string; color: string }[]
}) {
  function getTagColor(tag: string) {
    const t = tags.find((t) => t.name === tag)
    return t?.color || '#6b7280'
  }
  return (
    <Table>
      <TableBody>
        {rows.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell>
              <Link to={`/issues/${issue.number}`}>
                <div className="flex flex-col items-start">
                  <div className="flex  items-center space-x-1">
                    {issue.state === 'open' ? (
                      <Bookmark className="text-red-700 h-4 w-4" />
                    ) : (
                      <BookmarkCheck className="text-green-700 h-4 w-4 " />
                    )}
                    <p className="text-lg font-bold">{issue.title}</p>
                  </div>
                  <p className="text-gray-600 text-sm ml-5">
                    #{issue.number} {issue.createdByName} opened{' '}
                    {format(issue.createdAt, 'MMM dd, yyyy')}
                  </p>
                </div>
              </Link>
            </TableCell>
            <TableCell>
              <Link to={`/issues/${issue.number}`}>
                <div className="flex justify-center items-center space-x-1  ">
                  <ThumbsUp className="text-gray-400 h-4 w-4" />
                  <p className="text-xs flex text-gray-400">
                    {issue.numUpvotes}
                  </p>
                </div>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function Issues() {
  const data = useLoaderData<typeof loader>()
  const [search, setSearch] = useSearchParams()
  const filters = IssueFilters.parse(Object.fromEntries(search.entries()))
  return (
    <div className="container mx-auto p-4">
      <div className="rounded-md border">
        <div className="flex flex-col space-y-2 p-3">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search"
              defaultValue={filters.search}
              className="bg-white"
              onChange={(e) => {
                setSearch((prev) => {
                  prev.set('search', e.target.value)
                  return prev
                })
              }}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex justify-between items-center">
              <div className="bg-muted text-muted-foreground gap-3 inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                <Button
                  data-state={filters.state === 'open' ? 'active' : 'inactive'}
                  className="data-[state=active]:bg-background dark:data-[state=active]:text-foreground bg-muted text-foreground hover:text-white cursor-pointer hover:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  onClick={() => {
                    setSearch((prev) => {
                      prev.set('state', 'open')
                      return prev
                    })
                  }}
                >
                  Open{' '}
                  {data.openCount > 0 ? <Badge>{data.openCount}</Badge> : ''}
                </Button>
                <Button
                  data-state={
                    filters.state === 'closed' ? 'active' : 'inactive'
                  }
                  onClick={() => {
                    setSearch((prev) => {
                      prev.set('state', 'closed')
                      return prev
                    })
                  }}
                  className="data-[state=active]:bg-background dark:data-[state=active]:text-foreground bg-muted text-foreground hover:text-white hover:data-[state=active]:text-foreground cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30  dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50  [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                  Closed
                  <Badge>{data.closedCount}</Badge>
                </Button>
              </div>
            </div>
            <div className="flex space-x-1">
              <FacetedFilter
                title="Author"
                values={filters.authors ? filters.authors : []}
                onChange={(values) => {
                  if (values.length === 0) {
                    setSearch((prev) => {
                      prev.delete('authors')
                      return prev
                    })
                  } else {
                    setSearch((prev) => {
                      prev.set('authors', values.join(','))
                      return prev
                    })
                  }
                }}
                options={data.authorOptions}
              />
            </div>
          </div>
        </div>
        <div>
          <Link to="/issues/2"> Issue</Link>
        </div>
        <IssuesTable
          rows={data.rows.map((r) => IssueSchema.parse(r))}
          tags={[]}
        />
      </div>
      <BasicPagination totalRowCount={data.totalCount} />
    </div>
  )
}
