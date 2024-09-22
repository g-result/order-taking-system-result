import type { Prisma, RecommendTag } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const recommendTagRepository = {
  async create(
    data: Prisma.RecommendTagCreateManyInput
  ): Promise<RecommendTag> {
    return await prisma.recommendTag.create({ data })
  },
  async findAll(): Promise<RecommendTag[]> {
    return await prisma.recommendTag.findMany({
      orderBy: { id: 'asc' }
    })
  },

  async findMany(
    page = 1,
    pageSize = 10
  ): Promise<{ tags: RecommendTag[]; total: number }> {
    const skip = (page - 1) * pageSize
    const tags = await prisma.recommendTag.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { id: 'asc' },
      include: {
        products: true
      }
    })
    const total = await prisma.recommendTag.count()
    return { tags, total }
  },

  async findUnique(id: number): Promise<RecommendTag | null> {
    return prisma.recommendTag.findUnique({
      where: { id },
      include: {
        products: true
      }
    })
  },

  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.RecommendTagUpdateInput
  }): Promise<RecommendTag> {
    return prisma.recommendTag.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<RecommendTag> {
    return prisma.recommendTag.delete({
      where: { id }
    })
  },

  async multiDelete(
    ids: number[]
  ): Promise<{ tags: RecommendTag[]; total: number }> {
    await prisma.recommendTag.deleteMany({
      where: { id: { in: ids } }
    })
    const [tags, total] = await prisma.$transaction([
      prisma.recommendTag.findMany({
        orderBy: { id: 'asc' },
        include: {
          products: true
        }
      }),
      prisma.recommendTag.count()
    ])
    return { tags, total }
  }
}
