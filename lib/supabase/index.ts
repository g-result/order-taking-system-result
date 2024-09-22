import {
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  SERVICE_ROLE_KEY
} from '~/util/env'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const supabase = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// supabase 管理者権限
export const supabaseAdmin =
  typeof window === 'undefined'
    ? createClient(NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY)
    : null
