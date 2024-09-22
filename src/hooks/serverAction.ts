import { cookies } from 'next/headers'
/**
 * ログインしているかどうかを返す
 * SeverComponentにて認証認可のあるserverApiを叩く前に認証確認する
 * ※チェックしないとページごとエラーになる。
 *
 * @returns {boolean} ログインしているかどうか
 * */
export const getIsLoggedIn = (): boolean => {
  return !!cookies()
    .getAll()
    .find((c) => c.name.includes('sb-'))
}
