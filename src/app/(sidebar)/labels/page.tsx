'use client'
import { Box, Title } from '@mantine/core'
import TabsComponent from './_components/TabsComponent'

export default function CategoriesTagsPage() {
  return (
    <Box c="dark.4">
      <Title order={2} fz="18" mb="30">
        ラベル管理
      </Title>
      <TabsComponent />
    </Box>
  )
}
