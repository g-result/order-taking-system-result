import { TRPCError } from '@trpc/server'
import { userRepository } from '../repository/user'
import { $Enums } from '@prisma/client'
import { supabaseUserProcedure } from './supabaseAuth'

// 認証ミドルウェア
/**
 * ユーザーがログインしているかどうかを確認する
 * */
export const userProcedure = supabaseUserProcedure

/**
 *  ユーザーがADMINかどうかを確認する
 * */
export const adminProcedure = userProcedure.use(
  async ({ next, ctx: { userId, req } }) => {
    const user = await userRepository.findUnique(userId)
    if (user?.roleType !== $Enums.RoleType.ADMIN) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be an admin'
      })
    }
    return next({
      ctx: {
        userId
      }
    })
  }
)
