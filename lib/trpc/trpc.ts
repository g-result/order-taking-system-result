import type { User } from '@supabase/supabase-js'
import type { TRPCLink } from '@trpc/client'
import { type AnyRouter, initTRPC } from '@trpc/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import superjson from 'superjson'

export type MyContext = {
  req?: Request
  cookies?: { [key: string]: string }
  links?: TRPCLink<AnyRouter>[]
  cookieStore?: ReadonlyRequestCookies
  supabaseUser?: User
}

export const t = initTRPC.context<MyContext>().create({
  transformer: superjson
})
export const router = t.router

const loggingMiddleware = t.middleware(async ({ path, next }) => {
  console.log(`tRPC Request path: ${path}`)
  return next()
})
export const publicProcedure = t.procedure.use(loggingMiddleware)
