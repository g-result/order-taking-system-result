import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { orderRepository } from '../repository/order'
import { adminProcedure, userProcedure } from '../middleware'
import { convertCartToOrder } from '../service/order'
import { generateOrderPdf } from '../service/orderPdf'
import { sendMailWithPdf } from '~/lib/nodemailer'
import type {
  OrderDetails,
  OrderDetailsWithStock,
  OrderItemWithStock
} from '~/@types/order'

export const orderRouter = router({
  find: userProcedure.input(z.number()).query(async ({ input }) => {
    return await orderRepository.findUnique(input)
  }),

  findByUser: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId
    return await orderRepository.findManyByUser(userId)
  }),

  mine: userProcedure.query(async ({ ctx: { userId } }) => {
    return await orderRepository.findManyByUser(userId)
  }),

  findAll: adminProcedure.query(async (): Promise<OrderDetailsWithStock[]> => {
    const orders = await orderRepository.findAll()

    const productNames = orders.flatMap(
      (order) => order.items?.map((item) => item.productName) ?? []
    )
    const productVariants =
      await orderRepository.findProductVariantsByProductNames(productNames)

    const stockMap = new Map(
      productVariants.map((variant) => [variant.product.name, variant.quantity])
    )

    return orders.map((order) => ({
      ...order,
      items: order.items?.map(
        (item) =>
          ({
            ...item,
            currentStock: stockMap.get(item.productName) ?? 0
          }) as OrderItemWithStock
      )
    }))
  }),

  // 追加
  // キャンセルを元に戻す
  undoCancelOrder: adminProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      return await orderRepository.undoCancel(input)
    }),
  // 注文をキャンセルする
  cancelOrder: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return await orderRepository.cancelOrder(input.id, input.reason)
    }),

  create: userProcedure.mutation(
    async ({ ctx: { userId } }): Promise<{ error?: string | undefined }> => {
      const res = await convertCartToOrder(userId)
      if (res.error) return { error: res.error }
      if (!res.orderDetails) return { error: '注文情報が見つかりません' }
      // PDFをメールで送る
      try {
        // orderを発注書PDFにする
        const pdf = await generateOrderPdf(res.orderDetails)
        await sendMailWithPdf({
          sender: process.env.SENDER_EMAIL ?? '',
          receiver: process.env.RECEIVER_EMAIL ?? '',
          subject: '注文情報',
          message: '注文情報を添付します',
          pdfData: pdf
        })
      } catch (error) {
        console.error(error)
      }

      return res
    }
  ),
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        memo: z.string().optional()
      })
    )
    .mutation(async ({ input }) => {
      return await orderRepository.update({
        id: input.id,
        data: { memo: input.memo }
      })
    }),

  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    return await orderRepository.delete(input)
  }),

  updateMemo: userProcedure
    .input(
      z.object({
        id: z.number(),
        memo: z.string()
      })
    )
    .mutation(async ({ input }) => {
      return await orderRepository.updateMemo(input.id, input.memo)
    })
})
