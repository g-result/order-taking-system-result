import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { productVariantRepository } from '../repository/productVariant'
import { adminProcedure, userProcedure } from '../middleware'
import { ProductUnitType } from '@prisma/client'

export const productVariantRouter = router({
  list: userProcedure.query(async () => {
    return await productVariantRepository.findMany()
  }),
  find: userProcedure.input(z.number()).query(async ({ input }) => {
    return await productVariantRepository.findUnique(input)
  }),
  create: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        salesFormat: z.string(),
        unitType: z.nativeEnum(ProductUnitType),
        price: z.number(),
        tax: z.number().optional(),
        discountedPrice: z.number().nullable().optional(),
        quantity: z.number()
      })
    )
    .mutation(async ({ input }) => {
      return await productVariantRepository.create(input)
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        salesFormat: z.string().optional(),
        productId: z.number().optional(),
        unitType: z.nativeEnum(ProductUnitType).optional(),
        price: z.number().optional(),
        tax: z.number().optional(),
        discountedPrice: z.number().nullable().optional(),
        quantity: z.number().optional()
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return await productVariantRepository.update({
        id,
        data
      })
    }),
  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productVariantRepository.delete(input)
  })
})
