import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { db } from '~/db/db'
import { issuesTable, organizationsTable } from '~/db/schema'
import { eq, max } from 'drizzle-orm'
import {
  Link,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { RouteBoltTypeEnum, type RouteBoltType } from '~/constants/enums/routes'
import ComboBox from '~/components/ui/combobox'
import {
  IssueBoltIssueTypeEnum,
  IssueSeverityEnum,
} from '~/constants/enums/issues'
import { app } from '~/.server/app'
import { useEffect, useState } from 'react'
import { AppError } from '~/lib/result'

const IssueCreateSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    area: z.string().min(1, { message: 'Area is required' }),
    crag: z.string().min(1, { message: 'Crag is required' }),
    wall: z.string().min(1, { message: 'Wall is required' }),
    route: z.string().min(1, { message: 'Route name is required' }),
    text: z.string().min(1, { message: 'Description is required' }),
    boltType: RouteBoltTypeEnum,
    boltOrAnchor: z.enum(['bolt', 'anchor'], {
      required_error: 'Please select either bolt or anchor',
    }),
    boltNumber: z.number().optional(),
    boltIssue: IssueBoltIssueTypeEnum,
    severity: IssueSeverityEnum,
  })
  .refine(
    (data) => {
      // If boltOrAnchor is 'bolt', then boltNumber is required
      if (data.boltOrAnchor === 'bolt') {
        return !!data.boltNumber && data.boltNumber !== 0
      }
      // Otherwise, boltNumber is optional
      return true
    },
    {
      message: "Bolt number is required when 'Bolt' is selected",
      path: ['boltNumber'], // This targets the error to the boltNumber field
    },
  )

type IssueCreateFormValues = z.infer<typeof IssueCreateSchema>

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const issue = IssueCreateSchema.parse(data)

  const route = issue.route.split('/')
  const areaId = route[0]
  const cragId = route[1]
  const wallId = route[2]
  const routeId = route[3]

  const lastNumberRes = await db
    .select({ value: max(issuesTable.id) })
    .from(issuesTable)
  const lastNumber = parseInt(lastNumberRes[0]?.value || '0')
  const number = lastNumber ? lastNumber + 1 : 1
  const org = await db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.name, 'NRAC'),
  })
  if (!org) {
    throw new Error('Organization not found')
  }

  await db.insert(issuesTable).values({
    title: issue.title,
    text: issue.text,
    severity: issue.severity,
    areaId: areaId,
    cragId: cragId,
    wallId: wallId,
    routeId: routeId,
    type: issue.boltType,
    boltOrAnchor: issue.boltOrAnchor,
    boltNumber: issue.boltNumber,
    organizationId: org.id,
    createdById: '1',
    number,
  })
}

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.org) {
    throw new Error('Organization not found')
  }
  const org = await app.getOrgRouteData(params.org)
  if (org.error) {
    console.error(org.error)
    throw new AppError('Organization param not found', 'org.issues.create', {
      data: params.org,
    })
  }
  const { areas, crags, walls, routes } = org.data
  const boltTypeOptions = Object.values(RouteBoltTypeEnum.Values).map((b) => ({
    value: b,
    label: b,
  }))
  return {
    areas,
    crags,
    walls,
    routes,
    boltTypeOptions,
  }
}

export default function IssueCreate() {
  const { areas, crags, walls, routes, boltTypeOptions } =
    useLoaderData<typeof loader>()
  const form = useForm<IssueCreateFormValues>({
    resolver: zodResolver(IssueCreateSchema),
    defaultValues: {
      title: '',
      text: '',
      route: '',
      boltType: RouteBoltTypeEnum.enum['5 Piece and Hanger'],
      boltOrAnchor: 'bolt',
      boltNumber: 0,
      boltIssue: IssueBoltIssueTypeEnum.enum.Spinner,
      severity: IssueSeverityEnum.enum['1'],
    },
  })
  const [routeOptions, setRouteOptions] = useState<
    {
      value: string
      label: string
    }[]
  >(
    routes.map((r) => ({
      value: r.id,
      label: `${r.name} ${r.grade}`,
    })),
  )
  const [wallOptions, setWallOptions] = useState<
    {
      value: string
      label: string
    }[]
  >(
    walls.map((w) => ({
      value: w.id,
      label: w.name,
    })),
  )
  const [cragOptions, setCragOptions] = useState<
    {
      value: string
      label: string
    }[]
  >(
    crags.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  )

  function onSubmit(data: IssueCreateFormValues) {
    console.log(data)
    //  createIssue({ data: data })
  }

  const area = form.watch('area')
  const crag = form.watch('crag')
  const wall = form.watch('wall')
  const route = form.watch('route')

  // Update area, crag, wall, route based on the selected area, crag, wall, route
  useEffect(() => {
    if (route) {
      const routeData = routes.find((r) => r.id === route)
      if (routeData) {
        form.setValue('wall', routeData.wallId)
        const wallData = walls.find((w) => w.id === routeData.wallId)
        if (wallData) {
          form.setValue('crag', wallData.cragId)
          const cragData = crags.find((c) => c.id === wallData.cragId)
          if (cragData) {
            form.setValue('area', cragData.areaId)
          }
        }
      }
    }
    if (wall) {
      const wallData = walls.find((w) => w.id === wall)
      if (wallData) {
        setRouteOptions(
          routes
            .filter((r) => r.wallId === wallData.id)
            .map((r) => ({
              value: r.id,
              label: `${r.name} ${r.grade}`,
            })),
        )
        form.setValue('crag', wallData.cragId)
        const cragData = crags.find((c) => c.id === wallData.cragId)
        if (cragData) {
          form.setValue('area', cragData.areaId)
        }
      }
    }
    if (crag) {
      const cragData = crags.find((c) => c.id === crag)
      if (cragData) {
        form.setValue('area', cragData.areaId)
        setWallOptions(
          walls
            .filter((w) => w.cragId === cragData.id)
            .map((w) => ({
              value: w.id,
              label: w.name,
            })),
        )
      }
    }
    if (area) {
      const areaData = areas.find((a) => a.id === area)
      if (areaData) {
        setCragOptions(
          crags
            .filter((c) => c.areaId === areaData.id)
            .map((c) => ({
              value: c.id,
              label: c.name,
            })),
        )
      }
    }
  }, [area, crag, wall, route])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Issue</h1>
      </div>

      <div className="rounded-md border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Issue title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title for your issue. e.g. "Spinner on
                    Bolt 3 of Lost Souls"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Area</FormLabel>
                  <ComboBox
                    placeholder="Select an area"
                    options={areas.map((a) => ({
                      value: a.id,
                      label: a.name,
                    }))}
                    value={field.value}
                    onChangeValue={field.onChange}
                  />
                  <FormDescription>
                    The route where the bolt needs to be replaced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crag"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Crag</FormLabel>
                  <ComboBox
                    key={area}
                    placeholder="Select a crag"
                    options={cragOptions}
                    value={field.value}
                    onChangeValue={field.onChange}
                  />
                  <FormDescription>
                    The route where the bolt needs to be replaced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wall"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Wall</FormLabel>
                  <ComboBox
                    placeholder="Select a wall"
                    options={wallOptions}
                    value={field.value}
                    onChangeValue={field.onChange}
                  />
                  <FormDescription>
                    The route where the bolt needs to be replaced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Route</FormLabel>
                  <ComboBox
                    placeholder="Select a route"
                    options={routeOptions}
                    value={field.value}
                    onChangeValue={field.onChange}
                  />
                  <FormDescription>
                    The route where the bolt needs to be replaced
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="boltOrAnchor"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Bolt or Anchor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bolt">Bolt</SelectItem>
                        <SelectItem value="anchor">Anchor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Is it a bolt or an anchor?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="boltType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a bolt type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {boltTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of bolt</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="boltNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Bolt Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter bolt number"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Which bolt is it?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="boltIssue"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Issue Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="spinner">Spinner</SelectItem>
                        <SelectItem value="worn">Worn</SelectItem>
                        <SelectItem value="missing">Missing</SelectItem>
                        <SelectItem value="rusted">Rusted</SelectItem>
                        <SelectItem value="placement">Placement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      What is the issue with the bolt?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Minor</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How severe is this issue? (1-5)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the issue in detail"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide as much detail as possible about the issue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between space-x-2">
              <Button variant="outline" asChild>
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">Create Issue</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
