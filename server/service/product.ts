import {
  type Prisma,
  ProductUnitType,
  type ProductVariant
} from '@prisma/client'
import { divide } from '~/util'
import { productRepository } from '../repository/product'
import { productVariantRepository } from '../repository/productVariant'

const validateNonNegativeQuantity = (quantity: number): number => {
  return Math.max(0, quantity)
}

// 調整前と調整後のvariantsを返す関数
export const adjustQuantityInVariants = async (
  variants: ProductVariant[],
  productData: Prisma.ProductCreateInput,
  updatedTotalStock: number,
  id: number
): Promise<{
  allQuantityZeroVariants: ProductVariant[]
  autoAdjustedQuantityVariants: ProductVariant[]
}> => {
  const allQuantityZeroVariants = variants.map((variant) => ({
    ...variant,
    quantity: 0
  }))

  const autoAdjustVariantsQuantity = async (variants: ProductVariant[]) => {
    if (!productData.separateBackBelly) {
      return adjustUnSeparatedVariants(variants, updatedTotalStock)
    }

    const totalStock = await getTotalStock(id)
    const oldVariantsData = await getOldVariantsData(id)

    const { quaterBackStock, quaterBellyStock } = calculateStocks(
      variants,
      oldVariantsData,
      totalStock
    )

    return adjustSeparatedVariants(variants, quaterBackStock, quaterBellyStock)
  }

  try {
    const autoAdjustedQuantityVariants =
      await autoAdjustVariantsQuantity(variants)
    return {
      allQuantityZeroVariants,
      autoAdjustedQuantityVariants
    }
  } catch (error) {
    console.error('Error adjusting quantity in variants:', error)
    throw error
  }
}

// 背と腹を分けない場合の在庫数を調整
const adjustUnSeparatedVariants = (
  variants: ProductVariant[],
  updatedTotalStock: number
): ProductVariant[] => {
  return variants.map((variant) => {
    let quantity = 0
    if (variant.unitType === ProductUnitType.WHOLE) {
      quantity = divide(updatedTotalStock, 4, false)
    }
    if (variant.unitType === ProductUnitType.HALF_BODY) {
      quantity = divide(updatedTotalStock, 2, false)
    }
    if (variant.unitType === ProductUnitType.QUATER_BACK) {
      quantity = updatedTotalStock
    }
    return { ...variant, quantity: validateNonNegativeQuantity(quantity) }
  })
}

// 元の在庫数の合計を取得
const getTotalStock = async (id: number): Promise<number> => {
  return (await productRepository.getUniqueTotalStock(id)) ?? 0
}
// 元のvariantsデータを取得
const getOldVariantsData = async (id: number): Promise<ProductVariant[]> => {
  return productVariantRepository.findByProductId(id)
}

// 背と腹の在庫数を計算
const calculateStocks = (
  variants: ProductVariant[],
  oldVariantsData: ProductVariant[],
  totalStock: number
) => {
  let tempTotalStock = totalStock
  let differenceTotalStock = 0
  let quaterBackStock = 0
  let quaterBellyStock = 0

  for (const variant of variants) {
    if (variant.unitType === ProductUnitType.WHOLE) {
      const oldWholeQuantity = oldVariantsData.find(
        (oldVariant) => oldVariant.unitType === ProductUnitType.WHOLE
      )?.quantity
      const wholeDifference = variant.quantity - (oldWholeQuantity ?? 0)
      tempTotalStock += wholeDifference * 4
    }
    if (variant.unitType === ProductUnitType.HALF_BODY) {
      const oldHalfQuantity = oldVariantsData.find(
        (oldVariant) => oldVariant.unitType === ProductUnitType.HALF_BODY
      )?.quantity
      const halfDifference = variant.quantity - (oldHalfQuantity ?? 0)
      tempTotalStock += halfDifference * 2
      differenceTotalStock = tempTotalStock - totalStock
    }
    if (variant.unitType === ProductUnitType.QUATER_BACK) {
      const oldBackQuantity = oldVariantsData.find(
        (oldVariant) => oldVariant.unitType === ProductUnitType.QUATER_BACK
      )?.quantity
      const backDifference = variant.quantity - (oldBackQuantity ?? 0)
      quaterBackStock =
        (oldBackQuantity ?? 0) + differenceTotalStock / 2 + backDifference
      quaterBackStock = quaterBackStock < 0 ? 0 : quaterBackStock
      tempTotalStock += quaterBackStock
    }
    if (variant.unitType === ProductUnitType.QUATER_BELLY) {
      const oldBellyQuantity = oldVariantsData.find(
        (oldVariant) => oldVariant.unitType === ProductUnitType.QUATER_BELLY
      )?.quantity
      const bellyDifference = variant.quantity - (oldBellyQuantity ?? 0)
      quaterBellyStock =
        (oldBellyQuantity ?? 0) + differenceTotalStock / 2 + bellyDifference
      quaterBellyStock = quaterBellyStock < 0 ? 0 : quaterBellyStock
      tempTotalStock += quaterBellyStock
    }
  }

  quaterBackStock = validateNonNegativeQuantity(quaterBackStock)
  quaterBellyStock = validateNonNegativeQuantity(quaterBellyStock)

  return { quaterBackStock, quaterBellyStock }
}

// 背と腹を分ける場合の在庫数を調整
const adjustSeparatedVariants = (
  variants: ProductVariant[],
  quaterBackStock: number,
  quaterBellyStock: number
): ProductVariant[] => {
  return variants.map((variant) => {
    let quantity = 0
    if (variant.unitType === ProductUnitType.WHOLE) {
      if (quaterBackStock <= 0 || quaterBellyStock <= 0) {
        quantity = 0
      }
      if (quaterBackStock >= quaterBellyStock) {
        quantity = divide(quaterBellyStock, 2, false)
      }
      if (quaterBackStock < quaterBellyStock) {
        quantity = divide(quaterBackStock, 2, false)
      }
    }
    if (variant.unitType === ProductUnitType.HALF_BODY) {
      if (quaterBackStock <= 0 || quaterBellyStock <= 0) {
        quantity = 0
      }
      if (quaterBackStock >= quaterBellyStock) {
        quantity = quaterBellyStock
      }
      if (quaterBackStock < quaterBellyStock) {
        quantity = quaterBackStock
      }
    }
    if (variant.unitType === ProductUnitType.QUATER_BACK) {
      quantity = quaterBackStock
    }
    if (variant.unitType === ProductUnitType.QUATER_BELLY) {
      quantity = quaterBellyStock
    }
    return { ...variant, quantity: validateNonNegativeQuantity(quantity) }
  })
}
