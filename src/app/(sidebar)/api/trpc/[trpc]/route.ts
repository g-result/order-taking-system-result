import type { MyContext } from '~/lib/trpc/trpc'
import { appRouter } from '~/server/router'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const handler = (req: NextRequest) => {
  const cookieStore = cookies()
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }): MyContext => {
      return {
        req,
        cookies: parseCookies(req.headers.get('cookie')),
        cookieStore
      }
    }
  })
}

export { handler as GET, handler as POST }

function parseCookies(cookieHeader: string | null): { [key: string]: string } {
  const cookies: { [key: string]: string } = {}
  if (!cookieHeader) return cookies

  // biome-ignore lint/complexity/noForEach: <explanation>
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.split('=').map((c) => c.trim())
    cookies[name] = value
  })

  return cookies
}
