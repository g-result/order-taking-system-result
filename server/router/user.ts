import { z } from 'zod'
import { router, publicProcedure } from '~/lib/trpc/trpc'
import { userRepository } from '../repository/user'
import { adminProcedure, userProcedure } from '../middleware'
import type { Prisma } from '@prisma/client'
import { supabaseAdmin } from '~/lib/supabase'
import { convertClientInfoToCSV } from '~/util/exportCSV'

export const userRouter = router({
  register: publicProcedure
    .input(
      z.object({
        id: z.string(),
        shopName: z.string(),
        businessType: z.string().optional(),
        email: z.string().email(),
        name: z.string(),
        nameKana: z.string(),
        companyName: z.string().optional(),
        postalCode: z.string().optional(),
        prefecture: z.string().optional(),
        city: z.string().optional(),
        addressLine: z.string().optional(),
        phoneNumber: z.string(),
        transferName: z.string(),
        transferNameKana: z.string(),
        pushNotificationEnabled: z.boolean().optional()
      })
    )
    .mutation(async ({ input }) => {
      const user = { ...input, roleType: 'USER', approvalStatus: 'APPLYING' }
      return await userRepository.create(user as Prisma.UserCreateManyInput)
    }),
  // TODO: 認証のロジックをrouterもしくは、serverで行っても良いかも？
  /**
   * 管理者ログイン処理
   * @param input supabaseのユーザーID
   * @returns ユーザー情報
   * 注意：管理者のログイン以外では使用禁止
   */
  adminLogin: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const user = await userRepository.findUnique(input)
      if (!user) {
        throw new Error('User not found')
      }
      return user
    } catch (error) {
      console.error('Error during admin login:', error)
      throw new Error('Failed to login:')
    }
  }),
  // TODO: 認証のロジックをrouterもしくは、serverで行っても良いかも？
  /**
   * ユーザーログイン処理
   * @param input supabaseのユーザーID
   * @returns ユーザー情報
   * 注意：ユーザーのログイン以外では使用禁止
   */
  userLogin: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const user = await userRepository.findUnique(input)
      if (!user) {
        throw new Error('User not found')
      }
      return user
    } catch (error) {
      console.error('Error during user login:', error)
      throw new Error('Failed to login:')
    }
  }),
  mine: userProcedure.query(async ({ ctx: { userId } }) => {
    return await userRepository.findUnique(userId)
  }),

  find: adminProcedure.input(z.string()).query(async ({ input }) => {
    return await userRepository.findUnique(input)
  }),

  list: adminProcedure.query(async () => {
    return await userRepository.findAll()
  }),

  update: userProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        shopName: z.string().min(1, '店舗名は必須です。'),
        phoneNumber: z
          .string()
          .min(1, '電話番号は必須です。')
          .regex(/^\d+$/, '電話番号は半角数字で入力してください。'),
        businessType: z.string().optional(),
        postalCode: z.string().optional(),
        prefecture: z.string().optional(),
        city: z.string().optional(),
        addressLine: z.string().optional(),
        name: z.string().min(1, '名前は必須です。'),
        nameKana: z.string().min(1, '名前（カナ）は必須です。'),
        transferName: z.string().min(1, '振込名義は必須です。'),
        transferNameKana: z.string().min(1, '振込名義（カナ）は必須です。')
      })
    )
    .mutation(async ({ input, ctx: { userId } }) => {
      return await userRepository.update({
        id: userId,
        data: input
      })
    }),
  updatePushNotificationEnabled: userProcedure
    .input(z.boolean())
    .mutation(async ({ input, ctx: { userId } }) => {
      return await userRepository.update({
        id: userId,
        data: { pushNotificationEnabled: input }
      })
    }),
  updateDevicePushToken: userProcedure
    .input(z.string())
    .mutation(async ({ input, ctx: { userId } }) => {
      return await userRepository.update({
        id: userId,
        data: { devicePushToken: input }
      })
    }),
  delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
    if (!supabaseAdmin) return
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(input)
    if (error) {
      console.log('error', error)
      return
    }
    return await userRepository.delete(input)
  }),

  approve: adminProcedure
    .input(
      z.object({
        id: z.string(),
        approvalStatus: z.enum(['APPLYING', 'APPROVED', 'REJECTED'])
      })
    )
    .mutation(async ({ input }) => {
      const user = await userRepository.approve(input)
      return user
    }),

  createPasswordResetToken: publicProcedure
    .input(
      z.object({
        email: z.string(),
        passwordResetToken: z.string()
      })
    )
    .mutation(async ({ input: { passwordResetToken, email } }) => {
      const user = await userRepository.findByEmail(email)
      if (!user) return
      await userRepository.update({
        id: user.id,
        data: { passwordResetToken }
      })
      return
    }),
  verifyPasswordResetToken: publicProcedure
    .input(
      z.object({
        passwordResetToken: z.string()
      })
    )
    .mutation(async ({ input: { passwordResetToken } }) => {
      try {
        const user =
          await userRepository.findByPasswordResetToken(passwordResetToken)
        if (!user) return false
        return true
      } catch (error) {
        return false
      }
    }),
  resetPassword: publicProcedure
    .input(
      z.object({
        passwordResetToken: z.string(),
        password: z.string()
      })
    )
    .mutation(async ({ input: { passwordResetToken, password } }) => {
      const user =
        await userRepository.findByPasswordResetToken(passwordResetToken)
      if (!user) throw new Error('Invalid password reset token')
      await userRepository.update({
        id: user.id,
        data: { passwordResetToken: null }
      })
      await supabaseAdmin?.auth.admin.updateUserById(user.id, { password })
      return
    }),
  changeEmail: userProcedure
    .input(
      z.object({
        email: z.string().email()
      })
    )
    .mutation(async ({ ctx: { userId }, input: { email } }) => {
      await userRepository.update({
        id: userId,
        data: { email }
      })
      const res = await supabaseAdmin?.auth.admin.updateUserById(userId, {
        email
      })
      console.log(res)

      return
    }),
  // 顧客情報を全て、CSV形式でエクスポートする
  exportAllClientInfo: adminProcedure.query(async ({ input }) => {
    const user = await userRepository.findAll()
    return convertClientInfoToCSV(user)
  }),

  getUserSettings: userProcedure.query(async ({ ctx: { userId } }) => {
    const user = await userRepository.findUnique(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return {
      pushNotificationEnabled: user.pushNotificationEnabled
    }
  })
})
