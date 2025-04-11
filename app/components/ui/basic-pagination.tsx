import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '~/components/ui/button'

import { z } from 'zod'
import { Link, useSearchParams } from 'react-router'

const PAGE_SIZES = [10, 20, 30, 40, 50]

const PaginationSchema = z.object({
  pageIndex: z.coerce.number().int().nonnegative().default(0),
  pageSize: z.coerce.number().int().positive().default(15),
})

export function BasicPagination({ totalRowCount }: { totalRowCount: number }) {
  const [search, setSearch] = useSearchParams()
  const fromEntries = Object.fromEntries(search.entries())
  const { pageIndex, pageSize } = PaginationSchema.parse(fromEntries)
  const pageCount = Math.ceil(totalRowCount / pageSize) || 1

  return (
    <div className="flex w-full items-center justify-center px-2">
      <div className="flex items-center space-x-2 lg:space-x-8">
        <div className="flex items-center space-x-1">
          <p className="hidden w-[180px] text-sm font-medium md:block">
            Rows per page
          </p>
          <p className="block text-xs font-medium md:hidden">Per page</p>
          <select
            value={`${pageSize}`}
            onChange={(e) => {
              const size = e.target.value ? Number(e.target.value) : 0
              const newPageIndex =
                pageIndex < Math.ceil(totalRowCount / size)
                  ? pageIndex
                  : Math.max(Math.ceil(totalRowCount / size) - 1, 0)
              setSearch((prev) => {
                prev.append('pageSize', `${size}`)
                prev.append('pageIndex', `${newPageIndex}`)
                return prev
              })
            }}
            className="h-8 w-[70px] p-1 text-xs"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden w-[100px] items-center justify-center text-sm font-medium md:flex">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center justify-center text-xs font-medium md:hidden">
          {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            asChild
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={pageIndex === 0}
            onClick={() => {
              setSearch((prev) => {
                prev.append('pageIndex', `${0}`)
                return prev
              })
            }}
          >
            <div>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </div>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={pageIndex === 0}
            onClick={() => {
              setSearch((prev) => {
                prev.append('pageIndex', `${Math.max(pageIndex - 1, 0)}`)
                return prev
              })
            }}
          >
            <div>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={pageIndex === pageCount - 1}
            onClick={() => {
              setSearch((prev) => {
                prev.append(
                  'pageIndex',
                  `${Math.min(pageIndex + 1, pageCount - 1)}`,
                )
                return prev
              })
            }}
          >
            <div>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Button>
          <Button
            asChild
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={pageIndex === pageCount - 1}
            onClick={() => {
              setSearch((prev) => {
                prev.append('pageIndex', `${pageCount - 1}`)
                return prev
              })
            }}
          >
            <div>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
