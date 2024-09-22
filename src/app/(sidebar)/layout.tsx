import { NavbarHeader } from '@/components/navbarHeader'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <NavbarHeader>{children}</NavbarHeader>
}
