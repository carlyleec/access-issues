import { app } from '~/.server/app'
import type { ActionFunctionArgs } from 'react-router'

export async function action({ request }: ActionFunctionArgs) {
  return app.session.logout(request)
}
