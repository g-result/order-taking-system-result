'use client'
import { Input, useMantineTheme } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

export default function ProductSearchInput() {
  const theme = useMantineTheme()
  return (
    <Input
      size="md"
      placeholder="キーワード・タグで検索"
      leftSection={
        <IconSearch size={20} stroke={2} color={theme.colors.gray[5]} />
      }
    />
  )
}
