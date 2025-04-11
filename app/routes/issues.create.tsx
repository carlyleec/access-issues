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
import { areasTable, issuesTable } from '~/db/schema'
import { max } from 'drizzle-orm'
import { Link, useLoaderData, type ActionFunctionArgs } from 'react-router'

const IssueCreateSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required' }),
    routeName: z.string().min(1, { message: 'Route name is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    area: z.string().min(1, { message: 'Area is required' }),
    boltType: z.string().min(1, { message: 'Bolt Type is required' }),
    boltOrAnchor: z.enum(['bolt', 'anchor'], {
      required_error: 'Please select either bolt or anchor',
    }),
    boltNumber: z.string().optional(),
    boltIssue: z.enum(
      ['spinner', 'worn', 'missing', 'rusted', 'placement', 'other'],
      {
        required_error: 'Please select an issue',
      },
    ),
    severity: z
      .number()
      .min(1, { message: 'Severity is required' })
      .max(5, { message: 'Severity must be between 1 and 5' }),
  })
  .refine(
    (data) => {
      // If boltOrAnchor is 'bolt', then boltNumber is required
      if (data.boltOrAnchor === 'bolt') {
        return !!data.boltNumber && data.boltNumber.trim() !== ''
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

  const description = `
	Route Name: ${issue.routeName}
	Bolt or Anchor?: ${issue.boltOrAnchor}
	Bolt Type: ${issue.boltType}
	Bolt Number: ${issue.boltNumber}
	Bolt Issue: ${issue.boltIssue}
	Severity: ${issue.severity}
	------------
	Description:
	${issue.description}
	`
  const lastNumberRes = await db
    .select({ value: max(issuesTable.id) })
    .from(issuesTable)
  const lastNumber = parseInt(lastNumberRes[0]?.value || '0')
  const number = lastNumber ? lastNumber + 1 : 1
  await db.insert(issuesTable).values({
    title: issue.title,
    description: description,
    areaId: issue.area,
    organizationId: '1',
    createdById: '1',
    number,
  })
}

export async function loader() {
  const areas = await db.select().from(areasTable)
  const boltTypeOptions = [
    { value: '1', label: '5 Piece and Hanger' },
    { value: '2', label: 'Stud Bolt and Hanger' },
    { value: '3', label: 'Glue In' },
    { value: '4', label: 'Cold Shuts' },
    { value: '5', label: 'Other' },
  ]
  return {
    areaOptions: areas.map((a) => ({ value: a.id, label: a.name })),
    boltTypeOptions,
  }
}

export default function IssueCreate() {
  const { areaOptions, boltTypeOptions } = useLoaderData<typeof loader>()
  const form = useForm<IssueCreateFormValues>({
    resolver: zodResolver(IssueCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      area: '',
      boltType: '',
      boltOrAnchor: undefined,
      boltNumber: '',
      boltIssue: undefined,
      severity: undefined,
    },
  })

  function onSubmit(data: IssueCreateFormValues) {
    console.log(data)
    //  createIssue({ data: data })
  }

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
              name="routeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Route name" {...field} />
                  </FormControl>
                  <FormDescription>The name of the route</FormDescription>
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areaOptions.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The area where the bolt needs to be replaced
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
                name="description"
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
