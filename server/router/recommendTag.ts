import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { recommendTagRepository } from '../repository/recommendTag'
import { adminProcedure } from '../middleware'

export const recommendTagRouter = router({
  getAll: publicProcedure.query(async () => {
    return await recommendTagRepository.findAll()
  }),

  list: publicProcedure.query(async () => {
    return await recommendTagRepository.findAll()
  }),

  find: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await recommendTagRepository.findUnique(input)
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await recommendTagRepository.create(input)
      return await recommendTagRepository.findMany()
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await recommendTagRepository.update({
        id: input.id,
        data: input
      })
      return await recommendTagRepository.findMany()
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await recommendTagRepository.delete(input)
  }),

  multiDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      return await recommendTagRepository.multiDelete(input)
    })
})
