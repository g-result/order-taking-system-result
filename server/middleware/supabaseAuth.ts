import { t } from '~/lib/trpc/trpc'
import { TRPCError } from '@trpc/server'
import { createClient } from '~/lib/supabase/server'
import { decode } from 'jsonwebtoken'
// 認証ミドルウェア
/**
 * ユーザーがログインしているかどうかを確認する
 * */
export const supabaseUserProcedure = t.procedure.use(
  async ({ path, next, ctx: { req } }) => {
    console.log(`tRPC Request path: ${path}`)

    const supabase = createClient()
    const platformType = req?.headers.get('x-platform-type') // プラットフォームタイプを取得

    // React Native環境での認証ロジック
    if (platformType === 'react-native') {
      // const authHeader = req?.headers.get('authorization') || ''
      const token = req?.headers.get('x-auth-token') || ''
      if (!token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Token is required'
        })
      }
      try {
        // トークン検証ロジック（例：SupabaseのAdmin APIを使うか、jsonwebtokenでデコード＆検証）
        const userId = verifySupabaseToken(token)
        const {
          data: { user },
          error
        } = await supabase.auth.getUser(token)
        console.log({ userId })

        return next({
          ctx: { userId, supabaseUser: user }
        })
      } catch (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        })
      }
    }

    // Next.js環境での認証ロジック
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()
    if (!user || error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in'
      })
    }
    return next({
      ctx: {
        userId: user.id,
        supabaseUser: user
      }
    })
  }
)

function verifySupabaseToken(token: string): string {
  // JWTトークンのデコードと検証のロジックを実装
  const decoded = decode(token) as typeof exampleDecodedToken
  // Supabaseのユーザー情報が含まれているか確認
  if (decoded?.sub) return decoded.sub
  throw new Error('Invalid token')
}

const exampleDecodedToken = {
  aud: 'authenticated',
  exp: 1711336317,
  iat: 1711332717,
  iss: 'https://owqulfuifratdrqdiyom.supabase.co/auth/v1',
  sub: '72f0170b-eb6a-45c2-9e6f-1366411d6377',
  email: 'test3@gmail.com',
  phone: '',
  app_metadata: { provider: 'email', providers: [Array] },
  user_metadata: {
    email: 'test3@gmail.com',
    email_verified: false,
    phone_verified: false,
    sub: '72f0170b-eb6a-45c2-9e6f-1366411d6377'
  },
  role: 'authenticated',
  aal: 'aal1',
  amr: [[Object]],
  session_id: '27a7096a-6b41-49b9-9c4c-a62933e74492',
  is_anonymous: false
}
