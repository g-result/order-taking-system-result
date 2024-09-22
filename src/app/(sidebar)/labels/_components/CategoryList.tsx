import {
  Table,
  Button,
  Group,
  Menu,
  Text,
  Pagination,
  ActionIcon,
  Box,
  Center,
  Loader,
  Image
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDotsVertical, IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import CategoryForm from './CategoryForm'
import { clientApi } from '~/lib/trpc/client-api'
import type { Category as CategoryType } from '@prisma/client'
import React from 'react'
import { categoryIconMap } from '@/const/CategoryIcons'

export default function CategoryList() {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 100
  const [initialFormData, setInitialFormData] = useState<CategoryType | null>(
    null
  )
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const fetchCategoriesData = clientApi.category.list.useQuery()
  const isLoading = fetchCategoriesData.isLoading
  const [
    categoryFormOpened,
    { open: categoryFormModalOpen, close: categoryFormModalClose }
  ] = useDisclosure(false)

  const CategoryIconComponent = ({ name }: { name: string }) => {
    const Component = categoryIconMap[name]
    return Component ? <Component /> : null
  }

  useEffect(() => {
    if (fetchCategoriesData.isSuccess && fetchCategoriesData.data.length > 0) {
      const records = fetchCategoriesData.data.map((record) => {
        return {
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }
      })
      setCategories(records)
      setTotal(fetchCategoriesData.data.length)
      setTotalPages(Math.ceil(fetchCategoriesData.data.length / pageSize))
    } else {
      setCategories([])
    }
  }, [fetchCategoriesData.isSuccess, fetchCategoriesData.data])

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentCategories = categories.slice(startIndex, endIndex)

  const handleCategoryFormClick = () => {
    setInitialFormData(null)
    categoryFormModalOpen()
  }

  const handleCategoryEditClick = (category: CategoryType) => {
    setInitialFormData(category)
    categoryFormModalOpen()
  }

  const toggleVariant = (id: number) => {
    setActiveRow(activeRow === id ? null : id)
  }

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
  }

  return (
    <>
      <CategoryForm
        opened={categoryFormOpened}
        onClose={categoryFormModalClose}
        setCategories={setCategories}
        setPage={setPage}
        setTotal={setTotal}
        setTotalPages={setTotalPages}
        pageSize={pageSize}
        initialFormData={initialFormData}
      />
      <Group justify="flex-end">
        <Button
          leftSection={<IconPlus size={16} stroke={2} />}
          onClick={() => handleCategoryFormClick()}
        >
          カテゴリ登録
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
              <Table.Th>アイコン</Table.Th>
              <Table.Th>名前</Table.Th>
              <Table.Th>色</Table.Th>
              <Table.Th w={44}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentCategories.map((category) => (
              <Table.Tr key={category.id}>
                <Table.Td>
                  {(category.iconUrl !== null && category.iconUrl === 'crab') ||
                  category.iconUrl === 'shell' ? (
                    <Image
                      src={categoryIconMap[category.iconUrl]}
                      alt={category.name}
                      w={'24px'}
                      h={'24px'}
                    />
                  ) : (
                    <CategoryIconComponent name={category.iconUrl as string} />
                  )}
                </Table.Td>
                <Table.Td>{category.name}</Table.Td>
                <Table.Td>
                  <Box
                    w={24}
                    h={14}
                    style={{ backgroundColor: category.color || '#FFFFFF' }}
                  />
                </Table.Td>
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
                          activeRow === category.id ? 'blue.6' : 'transparent'
                        }
                        onClick={() => toggleVariant(category.id)}
                      >
                        <IconDotsVertical
                          size={20}
                          stroke={2}
                          color={activeRow === category.id ? '#fff' : '#354052'}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>操作を選択してください</Menu.Label>
                      <Menu.Item
                        onClick={() => handleCategoryEditClick(category)}
                      >
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
