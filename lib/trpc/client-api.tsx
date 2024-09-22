'use client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '~/server/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'

export const clientApi = createTRPCReact<AppRouter>({})

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}))
  const [trpcClient] = useState(() =>
    clientApi.createClient({
      links: [httpBatchLink({ url: '/api/trpc' })],
      transformer: superjson
    })
  )
  return (
    <clientApi.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </clientApi.Provider>
  )
}
