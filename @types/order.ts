import type { Order as OrderType, User, OrderItem } from '@prisma/client'

export type OrderDetails = OrderType & {
  user?: User
  items?: OrderItem[]
}

export type OrderItemWithStock = OrderItem & {
  currentStock?: number
}

export type OrderDetailsWithStock = Omit<OrderDetails, 'items'> & {
  items?: OrderItemWithStock[]
}
