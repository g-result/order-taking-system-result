'use client'
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Flex,
  Group,
  Menu,
  Pagination,
  Select,
  Table,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core'
import { TextInput, Button } from '@mantine/core'
import {
  IconArrowsVertical,
  IconChevronDown,
  IconDotsVertical,
  IconSearch
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import UserDetail from './UserDetail'
import { clientApi } from '~/lib/trpc/client-api'
import type { UserDetails } from '~/@types/user'
import type { ApprovalStatus } from '@prisma/client'
import PrefectureSelect, { prefectures } from './PrefectureSelect'
import { modals } from '@mantine/modals'
import { convertClientInfoToCSV, downloadCSV } from '~/util/exportCSV'

const getStatusColor = (status: ApprovalStatus) => {
  switch (status) {
    case 'APPLYING':
      return 'orange.5'
    case 'APPROVED':
      return 'green.5'
    case 'REJECTED':
      return 'gray.5'
    default:
      return 'gray.5'
  }
}
const getStatusLabel = (status: ApprovalStatus) => {
  switch (status) {
    case 'APPLYING':
      return '承認待ち'
    case 'APPROVED':
      return '使用中'
    case 'REJECTED':
      return 'アカウント停止'
    default:
      return '不明'
  }
}

export default function UserList() {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [activeRow, setActiveRow] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserDetails | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 100
  const [users, setUsers] = useState<UserDetails[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [prefectureFilter, setPrefectureFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const fetchUserData = clientApi.user.list.useQuery()
  const changeApprovalStatusMutation = clientApi.user.approve.useMutation()

  const handleExport = (userIds: string[]) => {
    const usersToExport = users.filter((user) => userIds.includes(user.id))
    const csvData = convertClientInfoToCSV(usersToExport)
    downloadCSV(csvData, 'user.csv')
  }
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(users.map((user) => user.id))
    } else {
      setSelectedRows([])
    }
  }, [selectAll, users])

  useEffect(() => {
    if (fetchUserData.isSuccess && fetchUserData.data) {
      const records = fetchUserData.data.map((record) => ({
        ...record,
        id: record.id,
        status: record.approvalStatus, // 承認ステータス
        shopName: record.shopName, // 店舗名
        companyName: record.companyName, // 会社名
        shopPhoneNumber: record.phoneNumber, // 電話番号
        managerName: record.name, // 担当者名
        shopPrefecture: record.prefecture, // 都道府県
        shopCity: record.city // 市区町村
      }))
      setTotal(fetchUserData.data.length)
      setTotalPages(Math.ceil(fetchUserData.data.length / pageSize))
      setUsers(records)
    } else {
      setUsers([])
    }
  }, [fetchUserData.isSuccess, fetchUserData.data])

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentUsers = users.slice(startIndex, endIndex)

  // 絞り込み機能
  useEffect(() => {
    if (fetchUserData.isSuccess && fetchUserData.data) {
      let filteredUsers = fetchUserData.data
      // ステータスで絞り込み
      if (statusFilter !== 'all') {
        if (statusFilter === 'APPLYING') {
          filteredUsers = filteredUsers.filter(
            (user) => user.approvalStatus === 'APPLYING'
          )
        } else if (statusFilter === 'APPROVED') {
          filteredUsers = filteredUsers.filter(
            (user) => user.approvalStatus === 'APPROVED'
          )
        } else if (statusFilter === 'REJECTED') {
          filteredUsers = filteredUsers.filter(
            (user) => user.approvalStatus === 'REJECTED'
          )
        }
      }
      // 都道府県で絞り込み
      if (prefectureFilter !== 'all') {
        const selectedPrefecture = prefectures.find(
          (p) => p.value === prefectureFilter
        )?.label
        filteredUsers = filteredUsers.filter(
          (user) => user.prefecture === selectedPrefecture
        )
      }
      // 店名・請求先会社名・電話番号・担当者名で検索
      if (searchQuery) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.shopName.includes(searchQuery) ||
            user.companyName?.includes(searchQuery) ||
            user.phoneNumber.includes(searchQuery) ||
            user.name.includes(searchQuery)
        )
      }
      setUsers(filteredUsers)
      setTotal(filteredUsers.length)
      setTotalPages(Math.ceil(filteredUsers.length / pageSize))
      if (page > Math.ceil(filteredUsers.length / pageSize)) {
        setPage(1)
      }
    } else {
      setUsers([])
    }
  }, [
    fetchUserData.isSuccess,
    fetchUserData.data,
    statusFilter,
    prefectureFilter,
    searchQuery
  ])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value)
  }

  const [
    userDetailModalOpened,
    { open: userDetailModalOpen, close: userDetailModalClose }
  ] = useDisclosure(false)

  const toggleVariant = (id: string) => {
    setActiveRow(activeRow === id ? null : id)
  }

  const handleRowClick = (user: UserDetails) => {
    setUserData({ ...user, statusColor: getStatusColor(user.approvalStatus) })
    userDetailModalOpen()
  }

  const handleMenuClose = () => {
    setActiveRow(null)
  }

  // ステータス変更
  const handleStatusChange = (
    user: UserDetails,
    newStatus: 'APPLYING' | 'APPROVED' | 'REJECTED'
  ) => {
    let title = ''
    let message = ''
    let updatedStatus = newStatus
    switch (newStatus) {
      case 'APPROVED':
        title = '確認'
        message = 'アカウントを承認してもよろしいですか？'
        break
      case 'REJECTED':
        title = '確認'
        message = 'アカウントを停止してもよろしいですか？'
        break
      case 'APPLYING':
        title = '確認'
        message = 'アカウントを再開してもよろしいですか？'
        updatedStatus = 'APPROVED'
        break
      default:
        return
    }
    modals.openConfirmModal({
      title,
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await changeApprovalStatusMutation.mutateAsync({
            id: user.id,
            approvalStatus: updatedStatus
          })
          fetchUserData.refetch()
        } catch (error) {
          console.error('Error updating status:', error)
          alert(
            'ステータスの更新中にエラーが発生しました。もう一度お試しください。'
          )
        }
      }
    })
  }
  // ステータス一括変更
  const handleMultiStatusChange = (action: string) => {
    if (selectedRows.length === 0) return
    let title = ''
    let message = ''
    let newStatus: 'APPLYING' | 'APPROVED' | 'REJECTED' = 'APPLYING'
    switch (action) {
      case 'approve':
        title = '確認'
        message = 'アカウントを承認してもよろしいですか？'
        newStatus = 'APPROVED'
        break
      case 'resume':
        title = '確認'
        message = 'アカウントを再開してもよろしいですか？'
        newStatus = 'APPROVED'
        break
      case 'delete':
        title = '確認'
        message = 'アカウントを停止してもよろしいですか？'
        newStatus = 'REJECTED'
        break
      default:
        return
    }
    modals.openConfirmModal({
      title,
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          for (const userId of selectedRows) {
            await changeApprovalStatusMutation.mutateAsync({
              id: userId,
              approvalStatus: newStatus
            })
          }
          fetchUserData.refetch()
        } catch (error) {
          console.error('Error updating status:', error)
          alert(
            'ステータスの更新中にエラーが発生しました。もう一度お試しください。'
          )
        }
      }
    })
  }

  const updateUserStatus = (userId: string, newStatus: ApprovalStatus) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, approvalStatus: newStatus } : user
    )
    setUsers(updatedUsers)
  }

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
  }

  const theme = useMantineTheme()
  return (
    <>
      <UserDetail
        opened={userDetailModalOpened}
        onClose={userDetailModalClose}
        user={userData}
        updateUserStatus={updateUserStatus}
      />
      <Box>
        <Flex justify="space-between" mb={15}>
          <Title order={2} fz="18">
            顧客管理
          </Title>
          <TextInput
            w={432}
            placeholder="店名・請求先会社名・電話番号・担当者名で検索"
            styles={{
              input: {
                background: '#F8F9FA'
              }
            }}
            leftSection={
              <IconSearch size={20} stroke={2} color={theme.colors.gray[5]} />
            }
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Flex>
        <Group justify="space-between" mb={10}>
          <Group>
            <Checkbox
              label="全て選択"
              checked={selectAll}
              onChange={(event) => setSelectAll(event.currentTarget.checked)}
            />
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
                <Menu.Item onClick={() => handleMultiStatusChange('approve')}>
                  アカウント承認
                </Menu.Item>
                <Menu.Item onClick={() => handleMultiStatusChange('resume')}>
                  アカウント再開
                </Menu.Item>
                <Menu.Item
                  color="red.6"
                  onClick={() => handleMultiStatusChange('delete')}
                >
                  アカウント停止
                </Menu.Item>
                <Menu.Item onClick={() => handleExport(selectedRows)}>
                  エクスポート
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Select
              w={180}
              placeholder="すべてのステータス"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value ?? 'all')}
              data={[
                { value: 'all', label: '全てのステータス' },
                { value: 'APPLYING', label: '承認待ち' },
                { value: 'APPROVED', label: '使用中' },
                { value: 'REJECTED', label: 'アカウント停止' }
              ]}
            />
            <PrefectureSelect
              value={prefectureFilter}
              onChange={(value) => setPrefectureFilter(value ?? 'all')}
            />
          </Group>
          <Group>
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
        </Group>
        <Table verticalSpacing="sm" withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={36}>
                <Checkbox checked={false} onChange={() => {}} indeterminate />
              </Table.Th>
              <Table.Th>ステータス</Table.Th>
              <Table.Th>店舗名</Table.Th>
              <Table.Th>請求先会社名</Table.Th>
              <Table.Th>店舗電話番号</Table.Th>
              <Table.Th>担当者名</Table.Th>
              <Table.Th>店舗都道府県</Table.Th>
              <Table.Th>店舗市区町村</Table.Th>
              <Table.Th>
                <Flex justify="space-between" align="center">
                  最終ログイン
                  <IconArrowsVertical
                    size={14}
                    stroke={2}
                    color={theme.colors.gray[5]}
                  />
                </Flex>
              </Table.Th>
              <Table.Th w={44}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentUsers.map((user) => (
              <Table.Tr
                key={user.id}
                style={{
                  color:
                    user.approvalStatus === 'REJECTED' ? '#A6A7AB' : 'inherit',
                  cursor: 'pointer'
                }}
                onClick={() => handleRowClick(user)}
              >
                <Table.Td>
                  <Checkbox
                    aria-label="Select row"
                    checked={selectedRows.includes(user.id)}
                    onChange={(event) => {
                      setSelectedRows(
                        event.currentTarget.checked
                          ? [...selectedRows, user.id]
                          : selectedRows.filter((id) => id !== user.id)
                      )
                    }}
                    onClick={(event) => event.stopPropagation()}
                  />
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(user.approvalStatus)}>
                    {getStatusLabel(user.approvalStatus)}
                  </Badge>
                </Table.Td>
                <Table.Td fw="700">{user.shopName}</Table.Td>
                <Table.Td>{user.companyName}</Table.Td>
                <Table.Td>{user.phoneNumber}</Table.Td>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{user.prefecture}</Table.Td>
                <Table.Td>{user.city}</Table.Td>
                <Table.Td>
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : '未ログイン'}
                </Table.Td>
                <Table.Td onClick={(event) => event.stopPropagation()}>
                  <Menu
                    withArrow
                    position="bottom-end"
                    shadow="md"
                    onClose={handleMenuClose}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant={
                          activeRow === user.id ? 'blue.6' : 'transparent'
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleVariant(user.id)
                        }}
                      >
                        <IconDotsVertical
                          size={20}
                          stroke={2}
                          color={activeRow === user.id ? '#fff' : '#354052'}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>操作を選択してください</Menu.Label>
                      {user.approvalStatus === 'APPLYING' && (
                        <Menu.Item
                          onClick={() => handleStatusChange(user, 'APPROVED')}
                        >
                          アカウント承認
                        </Menu.Item>
                      )}
                      {user.approvalStatus === 'APPROVED' && (
                        <Menu.Item
                          color="red.6"
                          onClick={() => handleStatusChange(user, 'REJECTED')}
                        >
                          アカウント停止
                        </Menu.Item>
                      )}
                      {user.approvalStatus === 'REJECTED' && (
                        <Menu.Item
                          onClick={() => handleStatusChange(user, 'APPLYING')}
                        >
                          アカウント再開
                        </Menu.Item>
                      )}
                      <Menu.Item onClick={() => handleExport([user.id])}>
                        エクスポート
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
            onChange={handlePageChange}
          />
        </Group>
      </Box>
    </>
  )
}
