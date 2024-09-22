import { serverApi } from '~/lib/trpc/server-api'

export default async function Layout({
  children,
  params: { token }
}: Readonly<{
  children: React.ReactNode
  params: { token: string }
}>) {
  const isVerifyPasswordResetToken =
    await serverApi().user.verifyPasswordResetToken({
      passwordResetToken: token
    })
  if (!isVerifyPasswordResetToken) {
    return <div>無効なトークンです。</div>
  }
  return <>{children}</>
}
