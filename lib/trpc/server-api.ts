import { httpBatchLink } from '@trpc/client'
import { appRouter } from '~/server/router'
import { t } from './trpc'
import { cookies } from 'next/headers'

const createCaller = t.createCallerFactory(appRouter)
export const serverApi = () => {
  const cookieStore = cookies()
  const cookie = cookieStore.getAll()
  const _cookies: { [key: string]: string } = {}
  for (const c of cookie) {
    _cookies[c.name] = c.value
  }
  const session = cookieStore.get('session')

  return createCaller({
    links: [httpBatchLink({ url: '/api/trpc' })],
    cookies: _cookies,
    cookieStore
  })
}
