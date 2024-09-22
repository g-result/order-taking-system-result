import type { ProductUnitType } from '@prisma/client'

/**
 * 在庫数を計算する関数
 * @param unitType - 商品の単位
 * @param quantity - 購入数
 * @param separateBackBelly - 背と腹を分けるかどうか
 * @param initWholeVariantQuantity - 全身の在庫数
 * @param initHalfVariantQuantity - 半身の在庫数
 * @param initBackVariantQuantity - 背の在庫数
 * @param initBellyVariantQuantity - 腹の在庫数
 * @returns 在庫数の変化後の値のオブジェクト
 * {　currentWholeVariantQuantity: number, currentHalfVariantQuantity: number, currentBackVariantQuantity: number, currentBellyVariantQuantity?: number }
 * */
export function calculateStockQuantity({
  unitType,
  quantity,
  separateBackBelly, // 不要？
  initWholeVariantQuantity,
  initHalfVariantQuantity,
  initBackVariantQuantity,
  initBellyVariantQuantity
}: {
  unitType: ProductUnitType
  quantity: number
  separateBackBelly?: boolean
  initWholeVariantQuantity: number
  initHalfVariantQuantity: number
  initBackVariantQuantity: number
  initBellyVariantQuantity?: number // 背と腹を分けない場合は不要
}): {
  currentWholeVariantQuantity: number
  currentHalfVariantQuantity: number
  currentBackVariantQuantity: number
  currentBellyVariantQuantity?: number
} {
  let currentWholeVariantQuantity = initWholeVariantQuantity
  let currentHalfVariantQuantity = initHalfVariantQuantity
  let currentBackVariantQuantity = initBackVariantQuantity
  let currentBellyVariantQuantity = initBellyVariantQuantity ?? 0

  // 全身がn個売れたら 全身-n 半身-2n 背-2n 腹-2n
  if (unitType === 'WHOLE') {
    currentWholeVariantQuantity -= quantity
    currentHalfVariantQuantity -= quantity * 2
    if (separateBackBelly) {
      currentBackVariantQuantity -= quantity * 2
      currentBellyVariantQuantity -= quantity * 2
    } else {
      currentBackVariantQuantity -= quantity * 4
    }
  }

  // 半身がn個売れたら半身-n 背-n 腹-n
  if (unitType === 'HALF_BODY') {
    if (initHalfVariantQuantity % 2 === 0) {
      // 半身在庫が偶数の場合 全身-(n/2)の切り上げ
      currentWholeVariantQuantity -= Math.ceil(quantity / 2)
    } else {
      // 半身在庫が奇数の場合 全身-(n/2)の切り捨て
      currentWholeVariantQuantity -= Math.floor(quantity / 2)
    }
    currentHalfVariantQuantity -= quantity
    if (separateBackBelly) {
      currentBackVariantQuantity -= quantity
      currentBellyVariantQuantity -= quantity
    } else {
      currentBackVariantQuantity -= quantity * 2
    }
  }

  // 1/4背がn個売れたら
  // 背-n
  // 背・腹在庫の小さい方で全身、半身の在庫調整
  if (separateBackBelly) {
    if (unitType === 'QUATER_BACK' && initBackVariantQuantity) {
      currentBackVariantQuantity -= quantity
      const minQuarterStock = initBellyVariantQuantity
        ? Math.min(currentBackVariantQuantity, currentBellyVariantQuantity)
        : currentBackVariantQuantity
      currentWholeVariantQuantity = Math.floor(minQuarterStock / 2)
      currentHalfVariantQuantity = minQuarterStock
    }
    // 1/4腹がn個売れたら
    // 腹-n
    // 背・腹在庫の小さい方で全身、半身の在庫調整
    if (unitType === 'QUATER_BELLY' && initBellyVariantQuantity) {
      currentBellyVariantQuantity -= quantity
      const minQuarterStock = Math.min(
        currentBackVariantQuantity,
        currentBellyVariantQuantity
      )
      currentWholeVariantQuantity = Math.floor(minQuarterStock / 2)
      currentHalfVariantQuantity = minQuarterStock
    }
  } else {
    // 注意点：現状、背と腹を分けない場合、1/4はすべてQUATER_BACKになる
    if (unitType === 'QUATER_BACK' && initBackVariantQuantity) {
      currentBackVariantQuantity -= quantity
      currentWholeVariantQuantity = Math.floor(currentBackVariantQuantity / 4)
      currentHalfVariantQuantity = Math.floor(currentBackVariantQuantity / 2)
    }
  }
  return {
    currentWholeVariantQuantity,
    currentHalfVariantQuantity,
    currentBackVariantQuantity,
    currentBellyVariantQuantity: separateBackBelly
      ? currentBellyVariantQuantity
      : undefined
  }
}
