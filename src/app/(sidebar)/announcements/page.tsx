'use client'
import { Suspense } from 'react'
import { Box, Loader, Title } from '@mantine/core'
import AnnouncementList from './_components/AnnouncementList'

export default function AnnouncementsPage() {
  return (
    <>
      <Box c="dark.4">
        <Title order={2} fz="18">
          お知らせ管理
        </Title>
        <Suspense fallback={<Loader />}>
          <AnnouncementList />
        </Suspense>
      </Box>
    </>
  )
}
