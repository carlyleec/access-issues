import { useNavigation } from 'react-router'
import { LoaderCircle } from 'lucide-react'

import { Button, buttonVariants } from './button'
import type { VariantProps } from 'class-variance-authority'

export function SubmitButton({
  title,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    title: string
  }) {
  const navigation = useNavigation()
  return (
    <Button
      disabled={navigation.state === 'submitting'}
      type="submit"
      {...props}
    >
      {navigation.state === 'submitting' ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        title
      )}
    </Button>
  )
}
