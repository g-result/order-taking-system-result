import type { User as UserType } from '@prisma/client'

export type UserDetails = UserType & {
  statusColor?: string
}
