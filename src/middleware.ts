import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextURL } from 'next/dist/server/web/next-url'
import {
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
  isLocal
} from '../util/env'
import { isProd } from '~/util'
/**
 * Next.js middleware
 * Supabaseのセッションを更新する
 * */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
}

export async function middleware(req: NextRequest) {
  const url: NextURL = req.nextUrl.clone()
  const response = NextResponse.next({
    request: {
      headers: req.headers
    }
  })
  // const authCookie = req.cookies.get('auth')
  // if (!authCookie) {
  //   const authResponse = handleBasicAuth(req)
  //   if (authResponse) {
  //     return authResponse
  //   }
  // }

  // APIリクエストの場合はそのまま返す
  if (
    req.nextUrl.pathname.includes('/api/trpc') ||
    req.nextUrl.pathname.includes('/api/cron')
  )
    return response
  // パスワード変更へのリダイレクトもそのまま返す
  if (req.nextUrl.pathname.includes('/password-reset')) return response

  const supabase = await updateSession(req, response)

  // Supabase からセッション取得
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.log(`${error.status}:${error.name}`)
  }

  if (!data.user) {
    if (
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/header_logo.svg'
    ) {
      return response
    }
    return NextResponse.redirect(`${url.origin}/login`)
  }

  // ログイン済みでログイン画面へのリクエストの場合、ダッシュボード画面へ
  if (req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(`${url.origin}/`)
  }

  // それ以外は認証OKでリダイレクト
  return response
}

export async function updateSession(request: NextRequest, res: NextResponse) {
  let response = res

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options
          })
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          })
          response.cookies.set({
            name,
            value,
            ...options
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options
          })
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          })
          response.cookies.set({
            name,
            value: '',
            ...options
          })
        }
      }
    }
  )

  return supabase
}

// export const handleBasicAuth = (req: NextRequest) => {
//   const basicAuth = req.headers.get('authorization')
//   if (!isProd && !isLocal) {
//     console.log('Basic認証', basicAuth)
//     if (basicAuth) {
//       const authValue = basicAuth.split(' ')[1]
//       console.log('Basic認証', authValue)
//       const [user, pwd] = atob(authValue).split(':')

//       if (
//         user === process.env.BASIC_AUTH_USER &&
//         pwd === process.env.BASIC_AUTH_PASSWORD
//       ) {
//         console.log('Basic認証成功')
//         const response = NextResponse.next()
//         response.cookies.set('auth', 'true', { httpOnly: true, secure: isProd })
//         return response
//       }
//     }
//     console.log('Basic認証失敗')
//     return new NextResponse('Auth Required.', {
//       status: 401,
//       headers: {
//         'WWW-Authenticate': 'Basic realm="Secure Area"'
//       }
//     })
//   }
//   return null // 本番環境では認証をスキップ
// }
