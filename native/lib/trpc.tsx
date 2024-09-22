import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '~/server/router'
import { supabase } from './supabase'
import superjson from 'superjson'
import { ORIGIN } from '@/util/env'
export const nativeApi = createTRPCReact<AppRouter>({})
export function NativeTRPCProvider({
  children
}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const url = `${ORIGIN}/api/trpc`
  const [trpcClient] = useState(() =>
    nativeApi.createClient({
      links: [
        httpBatchLink({
          url,
          async headers() {
            const { data } = await supabase.auth.getSession()
            const token = data.session?.access_token
            const headers = new Map<string, string>()
            headers.set('x-platform-type', 'react-native')
            if (token) headers.set('x-auth-token', token)
            // Basic認証の追加
            const basicAuth = btoa('yamaichi:yamaichi-0701')
            headers.set('Authorization', `Basic ${basicAuth}`)
            return Object.fromEntries(headers)
          }
        })
      ],
      transformer: superjson
    })
  )

  return (
    <nativeApi.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </nativeApi.Provider>
  )
}
