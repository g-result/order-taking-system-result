import { HOW_TO_SELL } from '../src/const/config'
import { ProductUnitType, RankEnum } from '@prisma/client'
import { z } from 'zod'
import type { AllProductsType } from '~/@types/product'

// 重複を削除
export const removeDuplicateValues = ([...array]) => {
  return array.filter((value, index, self) => self.indexOf(value) === index)
}
// スリープ
export const sleep = (ms: number): Promise<true> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}
// JSONかどうか
export const isJson = (data: string) => {
  try {
    JSON.parse(data)
  } catch (error) {
    return false
  }
  return true
}

// 日付を文字列に変換のコードを退避
export const convertStringToDate = (
  data: AllProductsType[]
): AllProductsType[] => {
  const records = data?.map((record) => ({
    ...record,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    categories: record.categories.map((category) => ({
      ...category,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
      category: {
        ...category.category,
        createdAt: new Date(category.category.createdAt),
        updatedAt: new Date(category.category.updatedAt)
      }
    })),
    tags: record.tags.map((tag) => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
      updatedAt: new Date(tag.updatedAt),
      tag: {
        ...tag.tag,
        createdAt: new Date(tag.tag.createdAt),
        updatedAt: new Date(tag.tag.updatedAt)
      }
    })),
    recommendTags: record.recommendTags.map((recommendTag) => ({
      ...recommendTag,
      createdAt: new Date(recommendTag.createdAt),
      updatedAt: new Date(recommendTag.updatedAt),
      recommendTag: {
        ...recommendTag.recommendTag,
        createdAt: new Date(recommendTag.recommendTag.createdAt),
        updatedAt: new Date(recommendTag.recommendTag.updatedAt)
      }
    })),
    images: record.images.map((image) => ({
      ...image,
      createdAt: new Date(image.createdAt),
      updatedAt: new Date(image.updatedAt)
    })),
    variants: record.variants.map((variant) => ({
      ...variant,
      createdAt: new Date(variant.createdAt),
      updatedAt: new Date(variant.updatedAt)
    }))
  }))
  return records
}

export const convertProductDataToEditFormData = (
  data: AllProductsType
): ProductFormValues | null => {
  if (!data) return null
  const {
    name,
    categories,
    tags,
    recommendTags,
    rank,
    origin,
    unit,
    description,
    isRecommended,
    pricingType,
    separateBackBelly,
    isPublished,
    variants,
    images
  } = data

  if (!description) return null

  const convertedVariants = variants.map((variant) => {
    const { salesFormat, unitType, price, tax, discountedPrice, quantity } =
      variant
    return {
      salesFormat,
      unitType,
      price,
      tax: tax || 10,
      discountedPrice: discountedPrice || 0,
      quantity
    }
  })

  // 全体、半身、背中、腹の順にソート
  sortVariants(convertedVariants)

  const convertedCategories = categories.map((category) => category.category.id)
  const convertedTags = tags.map((tag) => tag.tag.id)
  const convertedRecommendTags = recommendTags.map(
    (recommendTag) => recommendTag.recommendTag.id
  )

  return {
    name,
    categories: convertedCategories,
    tags: convertedTags,
    recommendTags: convertedRecommendTags,
    rank,
    origin,
    unit,
    description,
    isRecommended,
    pricingType,
    separateBackBelly,
    isPublished,
    variants: convertedVariants,
    images
  }
}

export const convertToNumberArray = (values: string[]): number[] => {
  return values.map((value) => Number.parseInt(value, 10))
}

export const convertToStringArray = (
  numbers?: number[]
): string[] | undefined => {
  return numbers?.map((number) => number.toString())
}

export const convertMultiSelectData = (
  data: { id: number; name: string }[]
) => {
  return data.map(({ id, name }) => {
    return { value: id.toString(), label: name }
  })
}

/**
 * バッジに応じて、条件を満たしているか確認し、真偽値を返す
 *
 * @param badgeName
 * @param product
 * @returns
 */
export const checkBadgeCondition = (
  badgeName: string,
  product: AllProductsType
): boolean => {
  const now = new Date()
  const createdAt = new Date(product.createdAt)
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

  switch (badgeName) {
    case '新入荷':
      return diffHours <= 24
    case 'セール':
      return product.variants.some(
        (variant) =>
          variant.discountedPrice !== null &&
          variant.discountedPrice !== 0 &&
          variant.discountedPrice < variant.price
      )
    case 'おすすめ':
      return product.isRecommended
    default:
      throw new Error(`Unsupported badge name: ${badgeName}`)
  }
}
/**
 * 引数に渡した値を割り算するして結果を返す
 * @param dividend 割られる値
 * @param divisor 割る値
 * @param isIncludeRemainder あまりを含めるかどうか
 * @returns number 割り算の結果
 */
export const divide: (
  dividend: number,
  divisor: number,
  isIncludeRemainder: boolean
) => number = (dividend, divisor, isIncludeRemainder) =>
  isIncludeRemainder
    ? Math.ceil(dividend / divisor)
    : Math.floor(dividend / divisor)

export type Variant = {
  salesFormat: string
  unitType: ProductUnitType
  price: number | undefined
  tax: number | undefined
  quantity: number
  discountedPrice?: number | undefined
}

export const sortVariants = (variants: ProductFormValues['variants']) => {
  const sortOrder = ['WHOLE', 'HALF_BODY', 'QUATER_BACK', 'QUATER_BELLY']

  variants.sort((a: Variant, b: Variant) => {
    const indexA = sortOrder.indexOf(a.unitType)
    const indexB = sortOrder.indexOf(b.unitType)

    // 定義された順序が見つからない場合は、元の順序を保持
    if (indexA === -1 && indexB === -1) {
      return 0
    }
    if (indexA === -1) {
      return 1
    }
    if (indexB === -1) {
      return -1
    }
    return indexA - indexB
  })
}

const variantSchema = z.object({
  salesFormat: z.string().min(1, { message: '売り方・単価は必須です' }),
  unitType: z.nativeEnum(ProductUnitType),
  price: z.number().min(0, { message: '価格は必須です' }),
  tax: z.number().min(0),
  discountedPrice: z.number().min(0).optional(),
  quantity: z.number().min(0, { message: '在庫数は必須です' })
})

const optionalVariantSchema = variantSchema.partial()

export const productFormSchema = z
  .object({
    name: z.string().min(1, { message: '商品名は必須です' }),
    categories: z.array(z.number()),
    tags: z.array(z.number()),
    recommendTags: z.array(z.number()),
    rank: z
      .nativeEnum(RankEnum)
      .refine((val) => Object.values(RankEnum).includes(val), {
        message: '星は必須です'
      }),
    origin: z.string().min(1, { message: '産地は必須です' }),
    unit: z.string().min(1, { message: '販売単位は必須です' }),
    description: z.string().min(1, { message: '商品詳細は必須です' }),
    isRecommended: z.boolean(),
    pricingType: z.string().min(1, { message: '売り方・単価は必須です' }),
    separateBackBelly: z.boolean(),
    isPublished: z.boolean(),
    variants: z.array(variantSchema),
    images: z.array(z.object({ url: z.string().url() })).optional()
  })
  .superRefine((data, ctx) => {
    if (data.pricingType !== '魚') {
      for (let i = 1; i < data.variants.length; i++) {
        const variant = data.variants[i]
        const parsed = optionalVariantSchema.safeParse(variant)
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `variantsのインデックス${i}の要素はすべてオプショナルですが、有効な値が必要です`,
            path: ['variants', i]
          })
        }
      }
    }
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

export const isProd =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_BASE_URL === 'https://www.yamaichi-j-app.com/'

// 商品の単位を文字列に変換する
export const convertUnitTypeToString = ({
  unitType,
  separateBackBelly
}: { unitType: ProductUnitType; separateBackBelly: boolean }) => {
  const unitTypeName = HOW_TO_SELL[unitType]
  const displayedUnitTypeName = separateBackBelly
    ? unitTypeName
    : unitTypeName.replace('背', '')
  return displayedUnitTypeName
}
