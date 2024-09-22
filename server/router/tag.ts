import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { tagRepository } from '../repository/tag'
import { adminProcedure } from '../middleware'
import { recommendTagRepository } from '../repository/recommendTag'

export const tagRouter = router({
  getAll: publicProcedure.query(async () => {
    return await tagRepository.findAll()
  }),

  list: publicProcedure.query(async () => {
    return await tagRepository.findAll()
  }),

  find: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await tagRepository.findUnique(input)
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await tagRepository.create(input)
      return await tagRepository.findMany()
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await tagRepository.update({
        id: input.id,
        data: input
      })
      return await tagRepository.findMany()
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    await tagRepository.delete(input)
    return await tagRepository.findMany()
  }),

  multiDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      await tagRepository.multiDelete(input)
      return await tagRepository.findMany()
    })
})
