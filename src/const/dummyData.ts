import type { ProductFormValues } from '@/app/(sidebar)/_components/ProductForm/EditForm'
import { ProductUnitType, RankEnum } from '@prisma/client'

const dummyData: ProductFormValues & { images: { url: string }[] } & {
  variants: {
    salesFormat: string
    unitType: ProductUnitType
    price: number
    tax: number
    quantity: number
    discountedPrice?: number
  }[]
} = {
  name: '商品20',
  description: '商品5の説明',
  origin: '産地5',
  unit: '単位1',
  isPublished: true,
  rank: RankEnum.FIVE, // Adjusted to use RankEnum
  isRecommended: false,
  pricingType: '魚',
  separateBackBelly: false,
  categories: [1, 2],
  tags: [1, 2],
  recommendTags: [1, 2],
  images: [
    {
      url: 'https://www.zukan-bouz.com/public_image/Fish/103/Thumb630/suzuki_1.jpg'
    },
    {
      url: 'https://www.zukan-bouz.com/public_image/Fish/74/Thumb630/20221128548.jpg'
    },
    {
      url: 'https://www.zukan-bouz.com/public_image/Fish/80/Thumb630/20230217845.jpg'
    }
  ],
  variants: [
    {
      salesFormat: '本',
      unitType: ProductUnitType.WHOLE,
      price: 1000,
      tax: 10,
      quantity: 10
    },
    {
      salesFormat: '本',
      unitType: ProductUnitType.HALF_BODY,
      price: 500,
      tax: 10,
      quantity: 20,
      discountedPrice: 200
    }
  ]
}
