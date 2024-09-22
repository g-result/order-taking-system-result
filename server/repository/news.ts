import type { Prisma, News } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const newsRepository = {
  async create(data: Prisma.NewsCreateManyInput): Promise<News> {
    return prisma.news.create({ data })
  },
  async findMany(): Promise<News[]> {
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
      where: {
        publishedAt: {
          lte: new Date()
        }
      }
    })
    return news
  },

  async findOne(): Promise<News | null> {
    return prisma.news.findFirst({
      where: {
        publishedAt: {
          lt: new Date()
        },
        publishedEndAt: {
          gte: new Date()
        }
      },
      orderBy: { publishedAt: 'desc' }
    })
  },

  async findUnique(id: number): Promise<News | null> {
    return prisma.news.findUnique({
      where: { id }
    })
  },

  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.NewsUpdateInput
  }): Promise<News> {
    return prisma.news.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<News> {
    return prisma.news.delete({
      where: { id }
    })
  },

  async multiDelete(ids: number[]): Promise<number> {
    const deleteResult = await prisma.news.deleteMany({
      where: { id: { in: ids } }
    })
    return deleteResult.count
  }
}
