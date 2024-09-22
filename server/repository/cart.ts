import type {
  Prisma,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  ProductImage
} from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

type CartType = Cart & {
  items: (CartItem & {
    productVariant: ProductVariant & {
      product: Product & {
        images: ProductImage[]
      }
    }
  })[]
}

export const cartRepository = {
  async create(data: Prisma.CartCreateManyInput): Promise<Cart> {
    return prisma.cart.create({ data })
  },

  async simpleFindByUser(userId: string): Promise<Cart | null> {
    return prisma.cart.findUnique({
      where: { userId }
    })
  },

  async findByUser(userId: string): Promise<CartType | null> {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    })
  },
  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.CartUpdateInput
  }): Promise<Cart> {
    return prisma.cart.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<Cart> {
    return prisma.cart.delete({
      where: { id }
    })
  }
}
