import { z } from 'zod'
import { publicProcedure, router } from '~/lib/trpc/trpc'
import { globalSettingsRepository } from '../repository/globalSettings'
import { adminProcedure } from '../middleware'
import { v4 as uuidv4 } from 'uuid'

export const globalSettingsRouter = router({
  find: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await globalSettingsRepository.findUnique(input)
  }),
  findFirst: publicProcedure.query(async () => {
    return await globalSettingsRepository.findFirst()
  }),
  upsert: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        overrideUsageRestriction: z.boolean()
      })
    )
    .mutation(async ({ input }) => {
      const id = input.id ?? uuidv4()
      const overrideUsageRestriction = input.overrideUsageRestriction
      return await globalSettingsRepository.upsert(overrideUsageRestriction, id)
    })
})
