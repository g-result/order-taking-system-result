import type { Prisma, Product } from '@prisma/client'
import type { AllProductsType } from '~/@types/product'
import { prisma } from '~/prisma/prismaClient'

export const productRepository = {
  async create(data: Prisma.ProductCreateInput): Promise<AllProductsType> {
    const product = await prisma.product.create({
      data,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        recommendTags: {
          include: {
            recommendTag: true
          }
        },
        images: true,
        variants: true
      }
    })
    return product as AllProductsType
  },

  async findPublishedProduct(): Promise<AllProductsType[]> {
    return prisma.product.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { id: 'asc' },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        recommendTags: {
          include: {
            recommendTag: true
          }
        },
        images: true,
        variants: true
      }
    })
  },

  async findProductsWithPagination(
    skip: number,
    pageSize: number
  ): Promise<{ products: AllProductsType[]; total: number }> {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { deletedAt: null },
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          recommendTags: {
            include: {
              recommendTag: true
            }
          },
          images: true,
          variants: true
        }
      }),
      prisma.product.count({
        where: { deletedAt: null }
      })
    ])
    return { products, total }
  },
  async findAllProductsWithCount(): Promise<{
    products: AllProductsType[]
    total: number
  }> {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          recommendTags: {
            include: {
              recommendTag: true
            }
          },
          images: true,
          variants: true
        }
      }),
      prisma.product.count({
        where: { deletedAt: null }
      })
    ])
    return { products, total }
  },
  async findAllProductsByCategoryIdWithCount(categoryId: number): Promise<{
    products: AllProductsType[]
    total: number
  }> {
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          categories: {
            some: {
              categoryId
            }
          },
          deletedAt: null
        },
        orderBy: { id: 'asc' },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          tags: {
            include: {
              tag: true
            }
          },
          recommendTags: {
            include: {
              recommendTag: true
            }
          },
          images: true,
          variants: true
        }
      }),
      prisma.product.count({
        where: {
          categories: {
            some: {
              categoryId
            }
          },
          deletedAt: null
        }
      })
    ])

    return { products, total }
  },

  async findUnique(id: number): Promise<AllProductsType | null> {
    return prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        recommendTags: {
          include: {
            recommendTag: true
          }
        },
        images: true,
        variants: true
      }
    })
  },

  async getUniqueTotalStock(id: number): Promise<number | null> {
    const data = await prisma.product.findUnique({
      where: { id },
      select: {
        totalStock: true
      }
    })

    return data?.totalStock ? data.totalStock : null
  },

  async update({
    id,
    data
  }: {
    id: number
    data: Prisma.ProductUpdateInput
  }): Promise<
    { id: number; data: Prisma.ProductUpdateInput } | { success: boolean }
  > {
    try {
      await prisma.product.update({
        where: { id },
        data
      })
      return { id, data }
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  async delete(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() }
    })
  },

  async multiDelete(
    ids: number[]
  ): Promise<{ products: Product[]; total: number }> {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date(), updatedAt: new Date() }
    })
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' }
      }),
      prisma.product.count({
        where: { deletedAt: null }
      })
    ])
    return { products, total }
  },

  async publish(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        publishedEndAt: null
      }
    })
  },

  async unpublish(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        isPublished: false,
        publishedEndAt: new Date()
      }
    })
  },

  async recommend(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { isRecommended: true }
    })
  },

  async unrecommend(id: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { isRecommended: false }
    })
  },

  findByRecommendTags: async (
    recommendTagIds: number[]
  ): Promise<AllProductsType[]> => {
    return prisma.product.findMany({
      where: {
        recommendTags: {
          some: {
            recommendTagId: {
              in: recommendTagIds
            }
          }
        },
        isPublished: true,
        deletedAt: null
      },
      orderBy: { isRecommended: 'desc' },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        recommendTags: {
          include: {
            recommendTag: true
          }
        },
        images: true,
        variants: true
      }
    })
  }
}
