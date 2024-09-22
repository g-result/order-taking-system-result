import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { tagRepository } from '../repository/tag'
import { recommendTagRepository } from '../repository/recommendTag'
import { categoryRepository } from '../repository/category'

const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional()
})

export const labelRouter = router({
  getAll: publicProcedure.query(async () => {
    const categories = await categoryRepository.findAll()
    const tags = await tagRepository.findAll()
    const recommendTags = await recommendTagRepository.findAll()
    return { categories, tags, recommendTags }
  })
})
