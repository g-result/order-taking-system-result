'use client'
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Menu,
  Pagination,
  Table,
  Text
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronDown,
  IconDotsVertical,
  IconPlus
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import AnnouncementForm from './AnnouncementForm'
import { clientApi } from '~/lib/trpc/client-api'
import type { News as NewsType } from '@prisma/client'
import { modals } from '@mantine/modals'

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<NewsType[]>([])
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [activeRow, setActiveRow] = useState<number | null>(null)

  const [initialFormData, setInitialFormData] = useState<NewsType | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 100
  const fetchNewsData = clientApi.news.list.useQuery()
  const [
    announcementFormOpened,
    { open: announcementFormModalOpen, close: announcementFormModalClose }
  ] = useDisclosure(false)

  const handleAnnouncementFormClick = () => {
    setInitialFormData(null)
    announcementFormModalOpen()
  }

  const handleAnnouncementEditClick = (announcement: NewsType) => {
    setInitialFormData(announcement)
    announcementFormModalOpen()
  }
  const deleteAnnouncementMutation = clientApi.news.delete.useMutation()
  const multiDeleteAnnouncementMutation =
    clientApi.news.multiDelete.useMutation()

  useEffect(() => {
    if (
      fetchNewsData.isSuccess &&
      fetchNewsData.data &&
      fetchNewsData.data.length > 0
    ) {
      const records = fetchNewsData.data.map((record) => {
        return {
          ...record
        }
      })
      setAnnouncements(records)
      setTotal(fetchNewsData.data.length)
      setTotalPages(Math.ceil(fetchNewsData.data.length / pageSize))
    } else {
      setAnnouncements([])
      setAnnouncements([])
    }
  }, [fetchNewsData.isSuccess, fetchNewsData.data])

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentAnnouncements = announcements.slice(startIndex, endIndex)

  const handleAnnouncementDeleteClick = async (announcement: NewsType) => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">お知らせを消去してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        const deletedCount = await deleteFunc([announcement.id])
        setAnnouncements(
          (prevAnnouncements) =>
            prevAnnouncements?.filter((t) => t.id !== announcement.id) || []
        )
        setTotal((total) => (total > 0 ? total - deletedCount : 0))
        const remainingAnnouncements = total - deletedCount
        const newTotalPages = Math.ceil(remainingAnnouncements / pageSize)
        if (page > newTotalPages) {
          setPage(newTotalPages)
        }
        setTotalPages(newTotalPages)
      }
    })
  }

  const handleMultiAnnouncementsDeleteClick = () => {
    if (selectedRows.length === 0) return
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">お知らせを消去してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        const deletedCount = await deleteFunc(selectedRows)
        setAnnouncements(
          (prevAnnouncements) =>
            prevAnnouncements?.filter(
              (Announcement) => !selectedRows.includes(Announcement.id)
            ) || []
        )
        setTotal((total) => (total > 0 ? total - deletedCount : 0))
        const remainingAnnouncements = total - deletedCount
        const newTotalPages = Math.ceil(remainingAnnouncements / pageSize)
        if (page > newTotalPages) {
          setPage(newTotalPages)
        }
        setTotalPages(newTotalPages)
        setSelectedRows([])
      }
    })
  }

  const deleteFunc = async (ids: number[]): Promise<number> => {
    try {
      if (ids.length === 1) {
        await deleteAnnouncementMutation.mutateAsync(ids[0])
        return 1
      }
      const result = await multiDeleteAnnouncementMutation.mutateAsync(ids)
      return result.deletedCount
    } catch (error) {
      console.error('Error deleting announcements:', error)
      alert('お知らせの削除中にエラーが発生しました。もう一度お試しください。')
      return 0
    }
  }

  const toggleVariant = (id: number) => {
    setActiveRow(activeRow === id ? null : id)
  }
  const handleMenuClose = () => {
    setActiveRow(null)
  }

  return (
    <>
      <AnnouncementForm
        opened={announcementFormOpened}
        onClose={announcementFormModalClose}
        setAnnouncements={setAnnouncements}
        setPage={setPage}
        setTotal={setTotal}
        setTotalPages={setTotalPages}
        pageSize={pageSize}
        initialFormData={initialFormData}
      />
      <Group justify="flex-end" mb={15}>
        <Button
          leftSection={<IconPlus size={16} stroke={2} />}
          ml={16}
          onClick={() => handleAnnouncementFormClick()}
        >
          お知らせ登録
        </Button>
      </Group>
      <Group justify="space-between" mb={10}>
        <Menu shadow="md" width={200} withArrow id="bottom-start">
          <Menu.Target>
            <Button
              rightSection={<IconChevronDown size={16} stroke={2} />}
              disabled={selectedRows.length === 0}
            >
              {selectedRows.length}件選択中
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>操作を選択してください</Menu.Label>
            <Menu.Item
              color="red.6"
              onClick={handleMultiAnnouncementsDeleteClick}
            >
              消去
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Group>
          <Text size="sm">
            {(page - 1) * pageSize + 1} -{' '}
            {page * pageSize < total ? page * pageSize : total} / {total}
          </Text>
          <Pagination
            size="sm"
            total={totalPages}
            value={page}
            onChange={setPage}
          />
        </Group>
      </Group>
      <Table verticalSpacing="sm" withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={36}>
              <Checkbox checked={false} onChange={() => {}} indeterminate />
            </Table.Th>
            <Table.Th>タイトル</Table.Th>
            <Table.Th>内容</Table.Th>
            <Table.Th>作成日時</Table.Th>
            <Table.Th>公開開始日時</Table.Th>
            <Table.Th>公開終了日時</Table.Th>
            <Table.Th w={44}>操作</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {currentAnnouncements.map((announcement) => (
            <Table.Tr key={announcement.id}>
              <Table.Td>
                <Checkbox
                  aria-label="Select row"
                  checked={selectedRows.includes(announcement.id)}
                  onChange={(event) =>
                    setSelectedRows(
                      event.currentTarget.checked
                        ? [...selectedRows, announcement.id]
                        : selectedRows.filter((id) => id !== announcement.id)
                    )
                  }
                />
              </Table.Td>
              <Table.Td>{announcement.title}</Table.Td>
              <Table.Td maw="220">
                <Text truncate="end" size="sm">
                  {announcement.content}
                </Text>
              </Table.Td>
              <Table.Td>{announcement.createdAt.toLocaleString()}</Table.Td>
              <Table.Td>{announcement.publishedAt.toLocaleString()}</Table.Td>
              <Table.Td>
                {announcement.publishedEndAt.toLocaleString()}
              </Table.Td>
              <Table.Td>
                <Menu
                  withArrow
                  position="bottom-start"
                  shadow="md"
                  onClose={handleMenuClose}
                >
                  <Menu.Target>
                    <ActionIcon
                      variant={
                        activeRow === announcement.id ? 'blue.6' : 'transparent'
                      }
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleVariant(announcement.id)
                      }}
                    >
                      <IconDotsVertical
                        size={20}
                        stroke={2}
                        color={
                          activeRow === announcement.id ? '#fff' : '#354052'
                        }
                      />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>操作を選択してください</Menu.Label>
                    <Menu.Item
                      onClick={() => handleAnnouncementEditClick(announcement)}
                    >
                      編集
                    </Menu.Item>
                    <Menu.Item
                      color="red.6"
                      onClick={() =>
                        handleAnnouncementDeleteClick(announcement)
                      }
                    >
                      消去
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="flex-end" mt={10}>
        <Text size="sm">
          {(page - 1) * pageSize + 1} -{' '}
          {page * pageSize < total ? page * pageSize : total} / {total}
        </Text>
        <Pagination
          size="sm"
          total={totalPages}
          value={page}
          onChange={setPage}
        />
      </Group>
    </>
  )
}
