import type { Prisma, Tag } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const tagRepository = {
  async create(data: Prisma.TagCreateManyInput): Promise<Tag> {
    return await prisma.tag.create({ data })
  },
  async findAll(): Promise<Tag[]> {
    return await prisma.tag.findMany({
      orderBy: { id: 'asc' }
    })
  },
  async findMany(
    page = 1,
    pageSize = 10
  ): Promise<{ tags: Tag[]; total: number }> {
    const skip = (page - 1) * pageSize
    const tags = await prisma.tag.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { id: 'asc' },
      include: {
        products: true
      }
    })
    const total = await prisma.tag.count()
    return { tags, total }
  },

  async findUnique(id: number): Promise<Tag | null> {
    return prisma.tag.findUnique({
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
    data: Prisma.TagUpdateInput
  }): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<Tag> {
    return await prisma.tag.delete({
      where: { id }
    })
  },

  async multiDelete(ids: number[]) {
    await prisma.tag.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })
  }
}
