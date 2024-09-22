import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { newsRepository } from '../repository/news'
import { adminProcedure } from '../middleware'

export const newsRouter = router({
  list: publicProcedure.query(async () => {
    return await newsRepository.findMany()
  }),

  findOne: publicProcedure.query(async () => {
    return await newsRepository.findOne()
  }),

  find: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await newsRepository.findUnique(input)
  }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        publishedAt: z.string(),
        publishedEndAt: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await newsRepository.create(input)
      return await newsRepository.findMany()
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        publishedAt: z.string(),
        publishedEndAt: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await newsRepository.update({
        id: input.id,
        data: input
      })
      return await newsRepository.findMany()
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await newsRepository.delete(input)
  }),
  multiDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const deletedCount = await newsRepository.multiDelete(input)
      return { deletedCount }
    })
})
