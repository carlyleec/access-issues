import type { ActionFunctionArgs } from 'react-router';
import { uploadImageAction } from '../lib/upload';

export async function action({ request }: ActionFunctionArgs) {
  return uploadImageAction({ request });
}
