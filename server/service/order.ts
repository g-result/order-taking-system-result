import {
  PrismaClient,
  type ProductVariant,
  type CartItem
} from '@prisma/client'
import { cartRepository } from '../repository/cart'
import { calculateStockQuantity } from './stock'
import type { OrderDetails } from '~/@types/order'

const prisma = new PrismaClient()

/**
 * ①カート情報を取得
 * ②在庫チェック
 * ③在庫更新
 * ④注文情報に変換する。
 * */
export async function convertCartToOrder(
  userId: string
): Promise<{ error?: string; orderDetails?: OrderDetails }> {
  try {
    // ユーザーIDに基づいてカートを取得
    const cart = await cartRepository.findByUser(userId)
    if (!cart) return { error: 'カートが見つかりません' }

    const res = await prisma.$transaction(async (prisma) => {
      // orderType:Orderの場合、在庫チェックと在庫更新
      for (const item of cart.items) {
        const productVariant = item.productVariant
        console.log({ item })

        if (item.orderType === 'Order') {
          // 在庫をロックして取得
          const lockedProductVariants = await prisma.$queryRaw<
            Array<{ quantity: number }>
          >`
            SELECT quantity FROM "ProductVariant"
            WHERE id = ${productVariant.id}
            FOR UPDATE
          `
          const lockedProductVariant = lockedProductVariants[0]
          if (
            !lockedProductVariant ||
            lockedProductVariant.quantity < item.quantity
          ) {
            return {
              error: `${productVariant.product.name}が在庫不足です。`
            }
          }

          /**
           * 在庫を減らす処理
           * */
          const product = productVariant.product
          const currentProductVariants = await prisma.productVariant.findMany({
            where: { productId: product.id }
          })
          const currentWholeVariant = currentProductVariants.find(
            ({ unitType }) => unitType === 'WHOLE'
          )
          const currentHalfVariant = currentProductVariants.find(
            ({ unitType }) => unitType === 'HALF_BODY'
          )
          const currentBackVariant = currentProductVariants.find(
            ({ unitType }) => unitType === 'QUATER_BACK'
          )
          const currentBellyVariant = currentProductVariants.find(
            ({ unitType }) => unitType === 'QUATER_BELLY'
          )
          const {
            currentWholeVariantQuantity,
            currentHalfVariantQuantity,
            currentBackVariantQuantity,
            currentBellyVariantQuantity
          } = calculateStockQuantity({
            unitType: productVariant.unitType,
            quantity: item.quantity,
            separateBackBelly: product.separateBackBelly,
            initWholeVariantQuantity: currentWholeVariant?.quantity ?? 0,
            initHalfVariantQuantity: currentHalfVariant?.quantity ?? 0,
            initBackVariantQuantity: currentBackVariant?.quantity ?? 0,
            initBellyVariantQuantity: currentBellyVariant?.quantity
          })
          currentWholeVariant &&
            (await prisma.productVariant.update({
              where: { id: currentWholeVariant.id },
              data: { quantity: currentWholeVariantQuantity }
            }))
          currentHalfVariant &&
            (await prisma.productVariant.update({
              where: { id: currentHalfVariant.id },
              data: { quantity: currentHalfVariantQuantity }
            }))
          currentBackVariant &&
            (await prisma.productVariant.update({
              where: { id: currentBackVariant.id },
              data: { quantity: currentBackVariantQuantity }
            }))
          currentBellyVariant &&
            (await prisma.productVariant.update({
              where: { id: currentBellyVariant.id },
              data: { quantity: currentBellyVariantQuantity }
            }))

          // totalStock更新
          await prisma.product.update({
            where: { id: product.id },
            data: {
              totalStock:
                currentBackVariantQuantity + (currentBellyVariantQuantity ?? 0)
            }
          })
        }
      }
      // 注文情報を作成
      const createdOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount: calculateTotalAmount(cart.items),
          orderNumber: generateOrderNumber(),
          orderDate: new Date(),
          orderQuantity: cart.items.reduce(
            (total, item) => total + item.quantity,
            0
          ),
          isCancelled: false,
          items: {
            create: cart.items.map(
              ({ productVariant, quantity, orderType }) => ({
                productName: `${productVariant.product.name}${
                  orderType === 'Request' ? '（※リクエスト商品）' : ''
                }`,
                salesFormat: productVariant.salesFormat,
                unitType: productVariant.unitType,
                price: productVariant.price,
                quantity,
                orderType,
                separateBackBelly: productVariant.product.separateBackBelly,
                productUnit: productVariant.product.unit,
                pricingType: productVariant.product.pricingType
              })
            )
          }
        },
        include: {
          user: true,
          items: true
        }
      })
      // カートをクリア
      await cartRepository.delete(cart.id)
      return createdOrder
    })
    if ('error' in res) return { error: res.error }
    return {
      orderDetails: res
    }
  } catch (error) {
    console.error('Error converting cart to order:', error)
    return { error: '注文に失敗しました' }
  }
}

// 合計金額を計算する関数
function calculateTotalAmount(
  cartItems: (CartItem & { productVariant: ProductVariant })[]
) {
  return cartItems.reduce(
    (total, item) => total + item.productVariant.price * item.quantity,
    0
  )
}

// 注文番号を生成する関数
function generateOrderNumber() {
  // ここでは、簡単な例として現在のタイムスタンプを使用しています。
  // 実際のアプリケーションでは、より適切な注文番号の生成ロジックを実装してください。
  return `ORDER-${Date.now()}`
}
