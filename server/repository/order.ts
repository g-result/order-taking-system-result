import type { OrderDetails } from '~/@types/order'
import type {
  Prisma,
  Order,
  ProductVariant,
  Product,
  OrderItem
} from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const orderRepository = {
  async findUnique(id: number): Promise<OrderDetails | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true
      }
    })
  },

  async findManyByUser(userId: string): Promise<OrderDetails[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: true
      }
    })

    return orders.map((order) => ({
      ...order,
      user: order.user,
      items: order.items
    }))
  },

  async findAll(): Promise<OrderDetails[]> {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: true
      }
    })
  },

  async findProductVariantsByProductNames(
    productNames: string[]
  ): Promise<(ProductVariant & { product: Pick<Product, 'name'> })[]> {
    return prisma.productVariant.findMany({
      where: {
        product: {
          name: {
            in: productNames
          }
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    })
  },

  // 追加
  async undoCancel(id: number): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { isCancelled: false }
    })
  },
  async cancelOrder(id: number, reason: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { isCancelled: true, cancelReason: reason }
    })
  },

  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.OrderUpdateInput
  }): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<Order> {
    return prisma.order.delete({
      where: { id }
    })
  },

  async updateMemo(id: number, memo: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { memo }
    })
  }
}
