import { useSubmit } from 'react-router'

export default function useJsonSubmit() {
  const submit = useSubmit()
  return (json: unknown) =>
    submit(JSON.stringify(json), {
      method: 'POST',
      encType: 'application/json',
    })
}
