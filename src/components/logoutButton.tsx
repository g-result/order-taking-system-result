'use client'

import { AFTER_SIGNOUT_PATH } from '@/const/config'
import { supabase } from '~/lib/supabase'

export const LogoutButton = () => {
  const signout = async () => {
    supabase.auth.signOut()
    window.location.assign(AFTER_SIGNOUT_PATH)
  }
  return <button onClick={signout}>ログアウト</button>
}
// SessionCookieを消す
