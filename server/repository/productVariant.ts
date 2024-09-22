import type { Prisma, ProductVariant } from '@prisma/client'
import { prisma } from '~/prisma/prismaClient'

export const productVariantRepository = {
  async create(
    data: Prisma.ProductVariantCreateManyInput
  ): Promise<ProductVariant> {
    return prisma.productVariant.create({ data })
  },
  async findMany(): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      orderBy: { id: 'asc' }
    })
  },
  async findByProductId(productId: number): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany({
      where: { productId }
    })
  },
  async findUnique(id: number): Promise<ProductVariant | null> {
    return prisma.productVariant.findUnique({
      where: { id }
    })
  },
  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.ProductVariantUpdateInput
  }): Promise<ProductVariant> {
    return prisma.productVariant.update({
      where: { id },
      data
    })
  },
  async delete(id: number): Promise<ProductVariant> {
    return prisma.productVariant.delete({
      where: { id }
    })
  }
}
