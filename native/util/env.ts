import { osName } from 'expo-device'

export const isDev = process.env.EXPO_PUBLIC_ENV === 'development'
export const isProd = process.env.EXPO_PUBLIC_ENV === 'production'

// androidエミュレータはlocalhost→10.0.2.2に変換する
// export const ORIGIN = 'https://stg-order-taking-system.vercel.app'
export const ORIGIN =
  isDev && osName === 'Android'
    ? ' http://10.0.2.2:3000'
    : process.env.EXPO_PUBLIC_ORIGIN
