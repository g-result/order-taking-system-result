'use client'
import { AFTER_SIGNIN_PATH, AFTER_SIGNOUT_PATH } from '@/const/config'
import { supabase } from '~/lib/supabase'
import type { User } from '@prisma/client'

type EmailAndPassword = {
  email: string
  password: string
}

/**
 * Webアプリは管理者ログインのみをサポート
 * @returns adminSignin: 管理者ログイン, signOut: ログアウト
 */
export const useSupabaseAuth = () => {
  /**
   * 管理者ログイン処理
   * @param email メールアドレス
   * @param password パスワード
   * @returns 管理者ログイン成功時はリダイレクト
   * @returns 管理者以外のログイン時はログアウト
   * @returns エラー時はコンソールにエラーを出力
   */
  const adminSignin = async (
    { email, password }: EmailAndPassword,
    adminLoginFunction: (input: string) => Promise<User>
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      console.log('error', error)
      return
    }
    if (!data) return
    const user = await adminLoginFunction(data.user?.id as string)
    if (user?.roleType === 'ADMIN') {
      console.log('signin成功', { data })
      window.location.assign(AFTER_SIGNIN_PATH)
      return
    }
    await supabase.auth.signOut()
    console.log('You must be an admin to sign in')
    return
  }

  /**
   * ログアウト処理
   * Cookieを削除し、ログアウト状態を反映するためにリダイレクトする
   */
  const signOut = async () => {
    await supabase.auth.signOut()
    console.log('signOut成功')
    window.location.assign(AFTER_SIGNOUT_PATH) // リダイレクトすることでミドルウェアを通してCookieを削除しログアウト状態を反映
  }

  return { adminSignin, signOut }
}
