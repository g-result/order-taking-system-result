import type {
  Product,
  ProductCategory,
  Category,
  ProductTag,
  Tag,
  ProductRecommendTag,
  RecommendTag,
  ProductImage,
  ProductVariant
} from '@prisma/client'

export type AllProductsType = Product & {
  categories: (ProductCategory & {
    category: Category
  })[]
  tags: (ProductTag & {
    tag: Tag
  })[]
  recommendTags: (ProductRecommendTag & {
    recommendTag: RecommendTag
  })[]
  images: ProductImage[]
  variants: ProductVariant[]
}

type DateToString<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K]
}

export type RowAllProductsType = DateToString<Product> &
  DateToString<{
    categories: (ProductCategory & {
      category: Category
    })[]
    tags: (ProductTag & {
      tag: Tag
    })[]
    recommendTags: (ProductRecommendTag & {
      recommendTag: RecommendTag
    })[]
    images: ProductImage[]
    variants: ProductVariant[]
  }>