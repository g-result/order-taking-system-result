import { sortVariants } from './../../util/index'
import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { productRepository } from '../repository/product'
import { adminProcedure, userProcedure } from '../middleware'
import { ProductUnitType, RankEnum } from '@prisma/client'
import type { Prisma, ProductVariant } from '@prisma/client'
import { productVariantRepository } from '../repository/productVariant'
import { divide } from '~/util'
import { adjustQuantityInVariants } from '../service/product'
import { calculateStockQuantity } from '../service/stock'

const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  category: z.string().nullable().optional()
})

const productVariantSchema = z.object({
  id: z.number().optional(),
  unitType: z.nativeEnum(ProductUnitType),
  price: z.number(),
  salesFormat: z.string(),
  tax: z.number().optional(),
  discountedPrice: z.number().nullable().optional(),
  quantity: z.number(),
  displayOrder: z.number().optional()
})

const productImageSchema = z.object({
  url: z.string().url() // 画像URL
})

const productCreateInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  origin: z.string(),
  unit: z.string(),
  categories: z.array(z.number()),
  pricingType: z.string(),
  separateBackBelly: z.boolean(),
  tags: z.array(z.number()),
  recommendTags: z.array(z.number()),
  isPublished: z.boolean().optional(),
  rank: z.nativeEnum(RankEnum),
  isRecommended: z.boolean().optional(),
  variants: z.array(productVariantSchema),
  images: z.array(productImageSchema).optional()
})

// 関連を接続するためのヘルパー関数
const connectById = (ids: number[]) => {
  return ids.map((id) => ({ id }))
}
export const productRouter = router({
  create: adminProcedure
    .input(productCreateInputSchema)
    .mutation(async ({ input }) => {
      console.log(input)
      const {
        variants,
        images,
        categories,
        tags,
        recommendTags,
        ...productData
      } = input

      const filteredVariants = variants.filter((variant) => {
        return variant.price !== 0 || variant.discountedPrice !== 0
      })

      // 魚タイプの商品の在庫を調整するため全体の在庫数を定義
      // 魚以外の場合は、全体数を設定しない
      const fishWholeStock =
        productData.pricingType !== '魚'
          ? 0
          : filteredVariants.find((variant) => variant.unitType === 'WHOLE')
              ?.quantity ?? 0
      const totalStock = fishWholeStock * 4

      //
      const autoAdjustedQuantityVariants = filteredVariants.map((variant) => {
        if (variant.unitType === 'WHOLE') return variant
        if (variant.unitType === 'HALF_BODY') {
          return { ...variant, quantity: divide(totalStock, 2, false) } // 半身の場合は半分にして、あまりは含めない
        }
        // 背と腹を分ける場合は半分にする
        const adjustedQuantity = productData.separateBackBelly
          ? divide(totalStock, 2, false)
          : totalStock
        return { ...variant, quantity: adjustedQuantity }
      })

      try {
        const product = await productRepository.create({
          ...(productData as Prisma.ProductCreateInput),
          totalStock,
          categories: {
            create: categories.map((categoryId) => ({
              category: { connect: { id: categoryId } }
            }))
          },
          tags: {
            create: tags.map((tagId) => ({
              tag: { connect: { id: tagId } }
            }))
          },
          recommendTags: {
            create: recommendTags.map((recommendTagId) => ({
              recommendTag: { connect: { id: recommendTagId } }
            }))
          },
          variants: {
            create: autoAdjustedQuantityVariants
          },
          images: {
            create: images
          }
        })
        return { product }
      } catch (e) {
        console.log(e)
      }
    }),
  /**
   * stockDataについて
   * 1. 魚タイプの商品の在庫を調整する場合、stockDataに在庫数を入れる
   * 2. stockDataはフロントエンドで増減した在庫を計算し、totalStockを更新するための値を渡す
   * 3. stockDataがない場合は、totalStockは変更されない
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: productCreateInputSchema
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      const {
        variants,
        images,
        categories,
        tags,
        recommendTags,
        ...productData
      } = data

      const updateData = {
        ...(productData as Prisma.ProductCreateInput),
        categories: {
          deleteMany: {},
          create: categories.map((categoryId) => ({
            category: { connect: { id: categoryId } }
          }))
        },
        tags: {
          deleteMany: {},
          create: tags.map((tagId) => ({
            tag: { connect: { id: tagId } }
          }))
        },
        recommendTags: {
          deleteMany: {},
          create: recommendTags.map((recommendTagId) => ({
            recommendTag: { connect: { id: recommendTagId } }
          }))
        },
        images: {
          deleteMany: {},
          create: images
        }
      }
      console.log('updateData', updateData.totalStock)

      // 魚の場合の在庫調整とvariantsの更新
      if (productData.pricingType === '魚') {
        const originalVariants =
          await productVariantRepository.findByProductId(id)

        const initialStock = {
          initWholeVariantQuantity:
            originalVariants.find((v) => v.unitType === 'WHOLE')?.quantity ?? 0,
          initHalfVariantQuantity:
            originalVariants.find((v) => v.unitType === 'HALF_BODY')
              ?.quantity ?? 0,
          initBackVariantQuantity:
            originalVariants.find((v) => v.unitType === 'QUATER_BACK')
              ?.quantity ?? 0,
          initBellyVariantQuantity:
            originalVariants.find((v) => v.unitType === 'QUATER_BELLY')
              ?.quantity ?? 0
        }
        let updatedStock = { ...initialStock }

        // 各variantの在庫の増減数をcalculateStockQuantityに渡して在庫調整。
        for (const variant of variants) {
          const originalVariant = originalVariants.find(
            (v) => v.unitType === variant.unitType
          )
          if (
            originalVariant &&
            originalVariant.quantity !== variant.quantity
          ) {
            const stockDifference = originalVariant.quantity - variant.quantity
            const tempUpdatedStock = calculateStockQuantity({
              unitType: variant.unitType,
              quantity: stockDifference,
              separateBackBelly: productData.separateBackBelly,
              ...updatedStock
            })
            updatedStock = {
              initWholeVariantQuantity:
                tempUpdatedStock.currentWholeVariantQuantity,
              initHalfVariantQuantity:
                tempUpdatedStock.currentHalfVariantQuantity,
              initBackVariantQuantity:
                tempUpdatedStock.currentBackVariantQuantity,
              initBellyVariantQuantity:
                tempUpdatedStock.currentBellyVariantQuantity ?? 0
            }
          }
        }
        console.log('updatedStock', updatedStock)

        // 在庫情報を更新
        const updatedVariants = variants.map((variant) => {
          let updatedQuantity: number
          switch (variant.unitType) {
            case 'WHOLE':
              updatedQuantity = updatedStock.initWholeVariantQuantity
              break
            case 'HALF_BODY':
              updatedQuantity = updatedStock.initHalfVariantQuantity
              break
            case 'QUATER_BACK':
              updatedQuantity = updatedStock.initBackVariantQuantity
              break
            case 'QUATER_BELLY':
              updatedQuantity =
                updatedStock.initBellyVariantQuantity ?? variant.quantity
              break
            default:
              updatedQuantity = variant.quantity
          }
          return { ...variant, quantity: updatedQuantity }
        })
        console.log('updatedVariants', updatedVariants)

        await Promise.all(
          updatedVariants.map(async (variant) => {
            if (variant.id !== undefined) {
              return productVariantRepository.update({
                id: variant.id,
                data: variant
              })
            }
          })
        )
      }

      // 魚以外の場合の在庫調整とvariantsの更新
      if (productData.pricingType !== '魚') {
        const variantsData = await productVariantRepository.findByProductId(id)
        await Promise.all(
          variantsData.map(async (variant, index) => {
            return productVariantRepository.update({
              id: variant.id,
              data: variants[index]
            })
          })
        )
      }
      return await productRepository.update({
        id,
        data: updateData
      })
    }),

  duplicate: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    const product = await productRepository.findUnique(input)
    if (!product) throw new Error('Product not found')
    const { id: _, ...productData } = product
    const newProductData: Prisma.ProductCreateInput = {
      ...productData,
      name: `【コピー】${productData.name}`,
      isPublished: false,
      totalStock: 0,
      categories: {
        create: product.categories.map(({ categoryId }) => ({
          category: { connect: { id: categoryId } }
        }))
      },
      tags: {
        create: product.tags.map(({ tagId }) => ({
          tag: { connect: { id: tagId } }
        }))
      },
      recommendTags: {
        create: product.recommendTags.map(({ recommendTagId }) => ({
          recommendTag: { connect: { id: recommendTagId } }
        }))
      },
      images: {
        create: product.images.map(({ url }) => ({ url }))
      },
      variants: {
        create: product.variants.map(
          ({ unitType, price, salesFormat, tax, discountedPrice }) => ({
            unitType,
            price,
            salesFormat,
            tax,
            discountedPrice,
            quantity: 0
          })
        )
      }
    }
    return await productRepository.create(newProductData)
  }),

  multiDuplicate: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      const duplicatedProducts = await Promise.all(
        input.map(async (productId) => {
          const product = await productRepository.findUnique(productId)
          if (!product) throw new Error('Product not found')
          const { id: _, ...productData } = product
          const newProductData: Prisma.ProductCreateInput = {
            ...productData,
            name: `【コピー】${productData.name}`,
            isPublished: false,
            totalStock: 0,
            categories: {
              create: product.categories.map(({ categoryId }) => ({
                category: { connect: { id: categoryId } }
              }))
            },
            tags: {
              create: product.tags.map(({ tagId }) => ({
                tag: { connect: { id: tagId } }
              }))
            },
            recommendTags: {
              create: product.recommendTags.map(({ recommendTagId }) => ({
                recommendTag: { connect: { id: recommendTagId } }
              }))
            },
            images: {
              create: product.images.map(({ url }) => ({ url }))
            },
            variants: {
              create: product.variants.map(
                ({ unitType, price, salesFormat, tax, discountedPrice }) => ({
                  unitType,
                  price,
                  salesFormat,
                  tax,
                  discountedPrice,
                  quantity: 0
                })
              )
            }
          }
          return await productRepository.create(newProductData)
        })
      )
      return duplicatedProducts
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productRepository.delete(input)
  }),
  multiDelete: adminProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input }) => {
      return await productRepository.multiDelete(input)
    }),
  list: userProcedure.query(async () => {
    return await productRepository.findPublishedProduct()
  }),
  listWithPagination: userProcedure
    .input(paginationSchema)
    .query(async ({ input }) => {
      const { page = 1, pageSize = 10, category } = input
      const skip = (page - 1) * pageSize
      return await productRepository.findProductsWithPagination(skip, pageSize)
    }),

  getAllProductsWithCount: userProcedure.query(async () => {
    return await productRepository.findAllProductsWithCount()
  }),
  getAllProductsByCategoryIdWithCount: userProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await productRepository.findAllProductsByCategoryIdWithCount(input)
    }),

  listProductsByRecommendTag: userProcedure
    .input(z.array(z.number()))
    .query(async ({ input }) => {
      return await productRepository.findByRecommendTags(input)
    }),

  find: userProcedure.input(z.number()).query(async ({ input }) => {
    return await productRepository.findUnique(input)
  }),

  publish: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productRepository.publish(input)
  }),

  unpublish: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productRepository.unpublish(input)
  }),

  recommend: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productRepository.recommend(input)
  }),

  unrecommend: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await productRepository.unrecommend(input)
  })
})
