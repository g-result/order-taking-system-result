import type { Prisma, ProductImage } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const productImageRepository = {
  async create(
    data: Prisma.ProductImageCreateManyInput
  ): Promise<ProductImage> {
    return prisma.productImage.create({ data })
  },

  async findUnique(id: number): Promise<ProductImage | null> {
    return prisma.productImage.findUnique({
      where: { id },
      include: {
        product: true
      }
    })
  },

  async findManyByProduct(productId: number): Promise<ProductImage[]> {
    return prisma.productImage.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    })
  },

  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.ProductImageUpdateInput
  }): Promise<ProductImage> {
    return prisma.productImage.update({
      where: { id },
      data
    })
  },

  async delete(id: number): Promise<ProductImage> {
    return prisma.productImage.delete({
      where: { id }
    })
  }
}
