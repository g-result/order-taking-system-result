import { ProductUnitType, RankEnum } from '@prisma/client'
import type { LinkProps } from 'next/link'
import { z } from 'zod'

// Cookieの有効期限
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 * 1000

// 認証後のリダイレクト先
export const AFTER_SIGNIN_PATH = '/' satisfies LinkProps['href']
export const AFTER_SIGNOUT_PATH = '/' satisfies LinkProps['href']

export const AFTER_SIGNUP_PATH = '/' satisfies LinkProps['href']

// 商品のランク
export const RANK_MAPPING = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5
}

// 商品バッジ
export const PRODUCT_BADGES = [
  { label: '新入荷', color: 'orange.6' },
  { label: 'セール', color: 'red.6' },
  { label: 'おすすめ', color: 'green.6' }
]

// 商品のソートオプション
export const SORT_OPTIONS = [
  { value: 'createdAtDesc', label: '作成日時が新しい順' },
  { value: 'createdAtAsc', label: '作成日時が古い順' },
  { value: 'stockDesc', label: '在庫の多い順' },
  { value: 'stockAsc', label: '在庫の少ない順' },
  { value: 'ratingDesc', label: '星の数順' },
  { value: 'priceDesc', label: '価格の高い順' },
  { value: 'priceAsc', label: '価格の安い順' },
  { value: 'recommended', label: 'おすすめ順' }
]

// 日付フォーマットのオプション
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}

export const HOW_TO_SELL = {
  WHOLE: '1本',
  HALF_BODY: '半身',
  QUATER_BACK: '1/4背',
  QUATER_BELLY: '1/4腹'
}

export const DEFAULTPRODUCTFORMVALUES: ProductFormValues = {
  name: '',
  categories: [],
  tags: [],
  recommendTags: [],
  rank: 'FIVE',
  origin: '',
  unit: '',
  description: '',
  isRecommended: false,
  pricingType: '魚',
  separateBackBelly: false,
  isPublished: false,
  variants: [
    {
      salesFormat: '本',
      unitType: ProductUnitType.WHOLE,
      price: 0,
      tax: 10,
      discountedPrice: 0,
      quantity: 0,
      displayOrder: 1
    },
    {
      salesFormat: '',
      unitType: ProductUnitType.HALF_BODY,
      price: 1000,
      tax: 10,
      discountedPrice: 900,
      quantity: 1
    },
    {
      salesFormat: '',
      unitType: ProductUnitType.QUATER_BACK,
      price: 0,
      tax: 10,
      discountedPrice: 0,
      quantity: 1
    }
  ]
}

const variantSchema = z.object({
  salesFormat: z.string().min(1, { message: '売り方・単価は必須です' }),
  unitType: z.nativeEnum(ProductUnitType),
  price: z.number().min(0, { message: '価格は必須です' }),
  tax: z.number().min(0),
  discountedPrice: z.number().min(0).optional(),
  quantity: z.number().min(0, { message: '在庫数は必須です' }),
  displayOrder: z.number().optional()
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

type ProductFormValues = z.infer<typeof productFormSchema>
