'use client'
import {
  Table,
  Button,
  Group,
  Menu,
  Text,
  Pagination,
  ActionIcon,
  Loader,
  Center
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDotsVertical, IconPlus } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { clientApi } from '~/lib/trpc/client-api'
import type { Tag as TagType } from '@prisma/client'
import RelatedTagForm from './RelatedTagForm'

export default function RelatedTagList() {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 100
  const [tags, setTags] = useState<TagType[]>()
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [initialFormData, setInitialFormData] = useState<TagType | null>(null)
  const [tagFormOpened, { open: tagFormModalOpen, close: tagFormModalClose }] =
    useDisclosure(false)

  const fetchRecommendTagsData = clientApi.recommendTag.list.useQuery()
  const isLoading = fetchRecommendTagsData.isLoading

  useEffect(() => {
    if (
      fetchRecommendTagsData.isSuccess &&
      fetchRecommendTagsData.data.length > 0
    ) {
      const records = fetchRecommendTagsData.data.map((record) => {
        return {
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }
      })
      setTags(records)
      setTotal(fetchRecommendTagsData.data.length)
      setTotalPages(Math.ceil(fetchRecommendTagsData.data.length / pageSize))
    } else {
      setTags([])
    }
  }, [fetchRecommendTagsData.isSuccess, fetchRecommendTagsData.data])

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentTags = tags?.slice(startIndex, endIndex)

  const handleTagFormClick = () => {
    setInitialFormData(null)
    tagFormModalOpen()
  }

  const handleTagEditClick = (tag: TagType) => {
    setInitialFormData(tag)
    tagFormModalOpen()
  }

  const toggleVariant = (id: number) => {
    setActiveRow(activeRow === id ? null : id)
  }

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
  }

  return (
    <>
      <RelatedTagForm
        opened={tagFormOpened}
        onClose={tagFormModalClose}
        setTags={setTags}
        setPage={setPage}
        setTotal={setTotal}
        setTotalPages={setTotalPages}
        pageSize={pageSize}
        initialFormData={initialFormData}
      />
      <Group justify="flex-end">
        <Button
          leftSection={<IconPlus size={16} stroke={2} />}
          onClick={() => handleTagFormClick()}
        >
          タグ登録
        </Button>
      </Group>
      <Group justify="flex-end" mt={20} mb={10}>
        <Text size="sm">
          {(page - 1) * pageSize + 1} -{' '}
          {page * pageSize < total ? page * pageSize : total} / {total}
        </Text>
        <Pagination
          size="sm"
          total={totalPages}
          value={page}
          onChange={handlePageChange}
        />
      </Group>
      {isLoading ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <Table verticalSpacing="sm" withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>名前</Table.Th>
              <Table.Th w={44}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentTags?.map((tag) => (
              <Table.Tr key={tag.id}>
                <Table.Td>{tag.name}</Table.Td>
                <Table.Td>
                  <Menu
                    withArrow
                    position="bottom-start"
                    shadow="md"
                    onClose={() => setActiveRow(null)}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant={
                          activeRow === tag.id ? 'blue.6' : 'transparent'
                        }
                        onClick={() => toggleVariant(tag.id)}
                      >
                        <IconDotsVertical
                          size={20}
                          stroke={2}
                          color={activeRow === tag.id ? '#fff' : '#354052'}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>操作を選択してください</Menu.Label>
                      <Menu.Item onClick={() => handleTagEditClick(tag)}>
                        編集
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <Group justify="flex-end" mt={10}>
        <Text size="sm">
          {(page - 1) * pageSize + 1} -{' '}
          {page * pageSize < total ? page * pageSize : total} / {total}
        </Text>
        <Pagination
          size="sm"
          total={totalPages}
          value={page}
          onChange={handlePageChange}
        />
      </Group>
    </>
  )
}
