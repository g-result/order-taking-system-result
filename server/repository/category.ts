import type { Prisma, Category, ProductCategory } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const categoryRepository = {
  async create(data: Prisma.CategoryCreateManyInput): Promise<Category> {
    return await prisma.category.create({ data })
  },

  async findAll(): Promise<Category[]> {
    return await prisma.category.findMany({
      orderBy: { id: 'asc' }
    })
  },

  async findMany(
    page = 1,
    pageSize = 10
  ): Promise<{ categories: Category[]; total: number }> {
    const skip = (page - 1) * pageSize
    const categories = await prisma.category.findMany({
      skip: skip,
      take: pageSize,
      orderBy: { id: 'asc' },
      include: {
        products: true
      }
    })
    const total = await prisma.category.count()
    return { categories, total }
  },

  async findUnique(id: number): Promise<Category | null> {
    return prisma.category.findUnique({
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
    data: Prisma.CategoryUpdateInput
  }): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<Category> {
    return await prisma.category.delete({
      where: { id }
    })
  },
  // 追加
  async multiDelete(
    ids: number[]
  ): Promise<{ categories: Category[]; total: number }> {
    await prisma.category.deleteMany({
      where: { id: { in: ids } }
    })
    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        orderBy: { id: 'asc' },
        include: {
          products: true
        }
      }),
      prisma.category.count()
    ])
    return { categories, total }
  }
}
