import { Box, Container, Title } from '@mantine/core'

export default function LoginLayout({
  children
}: { children: React.ReactNode }) {
  return (
    <Container size="423" py="xl">
      <Title order={1} ta="center" mb="1em">
        管理画面へようこそ
      </Title>
      {children}
    </Container>
  )
}
