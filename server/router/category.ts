import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { categoryRepository } from '../repository/category'
import { adminProcedure } from '../middleware'
import type { AllProductsType } from '~/@types/product'
import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductRecommendTag,
  ProductTag,
  ProductVariant,
  RecommendTag,
  Tag
} from '@prisma/client'

type Test = Product & {
  tags: (ProductTag & {
    tag: Tag
  })[]
  recommendTags: (ProductRecommendTag & {
    recommendTag: RecommendTag
  })[]
  categories: (ProductCategory & {
    ProductCategory: RecommendTag
  })[]
  images: ProductImage[]
  variants: ProductVariant[]
}

export const categoryRouter = router({
  getAll: publicProcedure.query(async () => {
    return await categoryRepository.findAll()
  }),

  list: publicProcedure.query(async () => {
    return await categoryRepository.findAll()
  }),

  find: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await categoryRepository.findUnique(input)
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        iconUrl: z.string().optional(),
        color: z.string().optional()
      })
    )
    .mutation(async ({ input }) => {
      await categoryRepository.create(input)
      return await categoryRepository.findMany()
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        iconUrl: z.string().optional(),
        color: z.string().optional()
      })
    )
    .mutation(async ({ input }) => {
      await categoryRepository.update({
        id: input.id,
        data: input
      })
      return await categoryRepository.findMany()
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await categoryRepository.delete(input)
  }),

  // 追加
  multiDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      return await categoryRepository.multiDelete(input)
    })
})
