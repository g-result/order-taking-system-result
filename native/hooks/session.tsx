import { AFTER_SIGNIN_PATH, AFTER_SIGNOUT_PATH } from '@/const/config'
import { supabase } from '@/lib/supabase'
import type { User } from '@prisma/client'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

/**
 * セッションを取得して、ログインしていない場合は指定のページにリダイレクトします。
 * */
export function useSession() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>()
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        console.log('onAuthStateChange', session?.user.email)
        if (!session) {
          router.push(AFTER_SIGNOUT_PATH)
          setSession(null)
        }
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  return session
}
type GetLoginUser = (id: string) => Promise<User>

/**
 * セッションをチェックして、ログイン済みの場合は指定のページにリダイレクトします。
 * */
export const useAutoLogin = (getLoginUser: GetLoginUser) => {
  const router = useRouter()
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data?.session) {
      const loginUser = await getLoginUser(data?.session?.user?.id as string)
      if (!loginUser || loginUser.approvalStatus !== 'APPROVED') {
        await supabase.auth.signOut()
        router.push(AFTER_SIGNOUT_PATH)
        console.log('checkSession', !!data?.session, data.session?.user.email)
        return
      }
      // セッションが有効であれば自動ログイン
      router.push(AFTER_SIGNIN_PATH)
      return
    }
  }
  useEffect(() => {
    checkSession()
  }, [router])
}
