import { z } from 'zod'

export const UuidV7Schema = z.string().uuid({ message: 'Required' })
export type UuidV7 = z.infer<typeof UuidV7Schema>
