import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { cartItemRepository } from '../repository/cartItem'
import { cartRepository } from '../repository/cart'
import { userProcedure } from '../middleware'
import { prisma } from '~/prisma/prismaClient'
import { OrderType } from '@prisma/client'

export const cartItemRouter = router({
  find: userProcedure.input(z.number()).query(async ({ input }) => {
    return await cartItemRepository.findUnique(input)
  }),

  findByCart: userProcedure.input(z.number()).query(async ({ input }) => {
    return await cartItemRepository.findManyByCart(input)
  }),

  create: userProcedure
    .input(
      z.object({
        productVariantId: z.number(),
        quantity: z.number(),
        orderType: z.nativeEnum(OrderType)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId

      return await prisma.$transaction(async (prisma) => {
        let cart = await cartRepository.simpleFindByUser(userId)

        if (!cart) {
          cart = await cartRepository.create({ userId })
        }

        const cartItem =
          await cartItemRepository.findByUserIdAndProductVariantId(
            userId,
            input.productVariantId
          )

        if (cartItem) {
          return await cartItemRepository.update({
            id: cartItem.id,
            data: { quantity: input.quantity + cartItem.quantity }
          })
        }

        return await cartItemRepository.create({
          cartId: cart.id,
          productVariantId: input.productVariantId,
          quantity: input.quantity,
          orderType: input.orderType
        })
      })
    }),

  update: userProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number()
      })
    )
    .mutation(async ({ input }) => {
      return await cartItemRepository.update({
        id: input.id,
        data: { quantity: input.quantity }
      })
    }),

  delete: userProcedure.input(z.number()).mutation(async ({ input }) => {
    return await cartItemRepository.delete(input)
  })
})
