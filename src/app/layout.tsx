import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '~/lib/trpc/client-api'
import '@mantine/core/styles.css'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Yamaichi-J',
  description: '山一水産の受発注アプリの管理画面'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TRPCProvider>
      <html lang="ja">
        <head>
          <ColorSchemeScript />
        </head>
        <body className={inter.className}>
          <MantineProvider>
            <ModalsProvider>{children}</ModalsProvider>
          </MantineProvider>
        </body>
      </html>
    </TRPCProvider>
  )
}
