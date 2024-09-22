// 環境
export const isProd = process.env.VERCEL_ENV === 'production'
export const isDevelopment = process.env.VERCEL_ENV === 'development'
export const isLocal = !!process.env.IS_LOCAL

export const isTest = process.env.NODE_ENV === 'test'
export const env = isProd
  ? 'production'
  : isDevelopment
    ? 'development'
    : isTest
      ? 'test'
      : 'local'
export const isBuild = process.env.NEXT_BUILD === 'true'

export const isMobile = typeof window !== 'undefined' && window.innerWidth < 600

export const isServer = typeof window === 'undefined'

export const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN ?? ''

// Supabase
export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
export const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY ?? ''
export const NEXT_PUBLIC_SUPABASE_STORAGE =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE ?? ''
