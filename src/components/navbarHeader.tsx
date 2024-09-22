'use client'
import {
  AppShell,
  Text,
  Box,
  Burger,
  Group,
  Image,
  NavLink,
  ScrollArea,
  useMantineTheme
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconFile,
  IconNotes,
  IconUsers,
  IconTag,
  IconNotification,
  IconLogout
} from '@tabler/icons-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '~/lib/supabase'

const data = [
  { link: '/', label: '商品管理', icon: IconFile },
  { link: '/orders', label: '注文履歴一覧', icon: IconNotes },
  { link: '/users', label: '顧客管理', icon: IconUsers },
  { link: '/labels', label: 'ラベル管理', icon: IconTag },
  { link: '/announcements', label: 'お知らせ管理', icon: IconNotification }
]

export function NavbarHeader({ children }: { children: React.ReactNode }) {
  const theme = useMantineTheme()
  const [opened, { toggle }] = useDisclosure()
  const [active, setActive] = useState(0)
  const [loginEmail, setLoginEmail] = useState<string | undefined>()
  const getLoginUserEmail = async () => {
    const { data } = await supabase.auth.getUser()
    setLoginEmail(data.user?.email)
  }

  useEffect(() => {
    const savedActive = localStorage.getItem('activePage')
    if (savedActive) {
      setActive(Number(savedActive))
    }
    getLoginUserEmail()
  }, [])

  const handleNavLinkClick = (index: number) => {
    setActive(index)
    localStorage.setItem('activePage', index.toString())
    toggle()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.assign('/login')
  }

  const items = data.map((item, index) => (
    <NavLink
      component={Link}
      mb="8"
      href={item.link as '/' | '/users' | '/labels' | '/announcements'}
      key={item.label}
      active={index === active}
      label={item.label}
      leftSection={
        <item.icon
          size={24}
          stroke={2}
          color={index === active ? theme.colors.blue[6] : theme.colors.gray[6]}
        />
      }
      onClick={() => handleNavLinkClick(index)}
      p="xs"
      variant="filled"
      color={index === active ? 'blue.0' : undefined}
      c={index === active ? 'blue.6' : 'gray.7'}
    />
  ))

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        width: 283,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="xl"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Box>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Image src="header_logo.svg" w={154} h="auto" alt="山一水産 ロゴ" />
          </Box>
          <Text c="gray.7" size="md">
            {loginEmail}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar px="md" pt="20" pb="16">
        <AppShell.Section grow component={ScrollArea}>
          {items}
        </AppShell.Section>
        <AppShell.Section
          styles={{
            section: {
              borderTop: `1px solid ${theme.colors.gray[3]}`
            }
          }}
          pt="md"
        >
          <NavLink
            component="button"
            label="ログアウト"
            leftSection={
              <IconLogout size={24} stroke={2} color={theme.colors.gray[6]} />
            }
            onClick={logout}
            c={theme.colors.gray[7]}
            p="xs"
            styles={{
              root: {
                cursor: 'pointer'
              }
            }}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main bg={'#fff'}>{children}</AppShell.Main>
    </AppShell>
  )
}
