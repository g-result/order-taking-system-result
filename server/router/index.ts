import { ProductVariant } from '@prisma/client'
import { publicProcedure, router } from '~/lib/trpc/trpc'
import { adminProcedure, userProcedure } from '../middleware'
import { userRouter } from './user'
import { productRouter } from './product'
import { tagRouter } from './tag'
import { categoryRouter } from './category'
import { cartRouter } from './cart'
import { cartItemRouter } from './cartItem'
import { orderRouter } from './order'
import { newsRouter } from './news'
import { recommendTagRouter } from './recommendTag'
import { productVariantRouter } from './productVariant'
import { labelRouter } from './label'
import { pdfRouter } from './pdfGenerator'
import { mailRouter } from './sendEmail'
import { globalSettingsRouter } from './globalSettings'

/**
 *
 * このファイルは、ルーターを定義するためのファイルです。
 * ルーターは、クライアントからのリクエストを受け取り、
 * リクエストに応じた処理を行います。
 *
 * v10のドキュメントを参照してください。
 * https://trpc.io/docs/v10/
 *
 * */
export const appRouter = router({
  user: userRouter,
  product: productRouter,
  ProductVariant: productVariantRouter,
  tag: tagRouter,
  category: categoryRouter,
  cart: cartRouter,
  cartItem: cartItemRouter,
  order: orderRouter,
  news: newsRouter,
  recommendTag: recommendTagRouter,
  label: labelRouter,
  pdf: pdfRouter,
  mail: mailRouter,
  globalSettings: globalSettingsRouter,
  // Public proceduresは、認証が不要なエンドポイントです。
  hello: publicProcedure.query(() => ({ msg: 'Hello World' })),
  // User proceduresは、ユーザーがログインしている場合にのみアクセスできるエンドポイントです。
  userInfo: userProcedure.query(({ ctx: { supabaseUser } }) => {
    console.log(supabaseUser)
    return supabaseUser
  }),
  // Admin proceduresは、ユーザーが管理者である場合にのみアクセスできるエンドポイントです。
  adminInfo: adminProcedure.query(({ ctx: { supabaseUser } }) => {
    console.log(supabaseUser)
    return supabaseUser
  })
})

export type AppRouter = typeof appRouter
