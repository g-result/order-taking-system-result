import type { Prisma, CartItem } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const cartItemRepository = {
  async create(data: Prisma.CartItemCreateManyInput): Promise<CartItem> {
    return prisma.cartItem.create({ data })
  },

  async findUnique(id: number): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        productVariant: {
          include: {
            product: true
          }
        }
      }
    })
  },

  async findByUserIdAndProductVariantId(
    userId: string,
    productVariantId: number
  ): Promise<CartItem | null> {
    return prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: userId
        },
        productVariantId: productVariantId
      },
      include: {
        cart: true,
        productVariant: {
          include: {
            product: true
          }
        }
      }
    })
  },

  async findManyByCart(cartId: number): Promise<CartItem[]> {
    return prisma.cartItem.findMany({
      where: { cartId },
      include: {
        productVariant: {
          include: {
            product: true
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
    data: Prisma.CartItemUpdateInput
  }): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<CartItem> {
    return prisma.cartItem.delete({
      where: { id }
    })
  },

  async updateItemQuantity(id: number, quantity: number): Promise<void> {
    await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    })
  }
}
