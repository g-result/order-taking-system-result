import type { UserDetails } from '~/@types/user'
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Modal,
  Stack,
  Table,
  Text
} from '@mantine/core'
import { IconDots } from '@tabler/icons-react'
import { useState } from 'react'
import type { ApprovalStatus } from '@prisma/client'
import { modals } from '@mantine/modals'
import { clientApi } from '~/lib/trpc/client-api'
import { convertClientInfoToCSV, downloadCSV } from '~/util/exportCSV'

export default function UserDetail({
  opened,
  onClose,
  user,
  updateUserStatus
}: {
  opened: boolean
  onClose: () => void
  user: (UserDetails & { statusColor?: string }) | null
  updateUserStatus: (userId: string, newStatus: ApprovalStatus) => void
}) {
  const [isActive, setIsActive] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)

  const changeApprovalStatusMutation = clientApi.user.approve.useMutation()

  const handleExport = () => {
    if (user) {
      const csvData = convertClientInfoToCSV([user])
      downloadCSV(csvData, 'user.csv')
    }
  }

  const toggleVariant = () => {
    setIsActive(!isActive)
  }
  const handleIconClick = (event: React.MouseEvent) => {
    toggleVariant()
    setMenuOpened((prev) => !prev)
  }

  const STAUTS_LABEL = {
    APPLYING: '承認待ち',
    APPROVED: '使用中',
    REJECTED: 'アカウント停止'
  }

  const handleStatusChange = async (
    user: UserDetails,
    newStatus: 'APPLYING' | 'APPROVED' | 'REJECTED'
  ) => {
    const updatedStatus = newStatus === 'APPLYING' ? 'APPROVED' : newStatus
    const message = `アカウントを${STAUTS_LABEL[updatedStatus]}してもよろしいですか？`

    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await changeApprovalStatusMutation.mutateAsync({
            id: user?.id,
            approvalStatus: updatedStatus
          })
          updateUserStatus(user.id, updatedStatus)
        } catch (error) {
          console.error('Error updating status:', error)
          alert(
            'ステータスの更新中にエラーが発生しました。もう一度お試しください。'
          )
        }
      }
    })
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="945"
        title="注文詳細"
        centered
        overlayProps={{
          backgroundOpacity: 0.4
        }}
        styles={{
          body: {
            padding: '24px'
          }
        }}
      >
        <Group justify="flex-end">
          <Menu
            withArrow
            position="bottom-start"
            shadow="md"
            opened={menuOpened}
            onClose={() => setMenuOpened(false)}
          >
            <Menu.Target>
              <ActionIcon
                variant={menuOpened ? 'blue.6' : 'transparent'}
                onClick={(event) => {
                  handleIconClick(event)
                }}
              >
                <IconDots
                  size={23}
                  stroke={2}
                  color={menuOpened ? '#fff' : '#354052'}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>操作を選択してください</Menu.Label>
              {user?.approvalStatus === 'APPLYING' && (
                <Menu.Item
                  onClick={() => {
                    handleStatusChange(user, 'APPROVED')
                    onClose()
                  }}
                >
                  アカウント承認
                </Menu.Item>
              )}
              {user?.approvalStatus === 'APPROVED' && (
                <Menu.Item
                  color="red.6"
                  onClick={() => {
                    handleStatusChange(user, 'REJECTED')
                    onClose()
                  }}
                >
                  アカウント停止
                </Menu.Item>
              )}
              {user?.approvalStatus === 'REJECTED' && (
                <Menu.Item
                  onClick={() => {
                    handleStatusChange(user, 'APPLYING')
                    onClose()
                  }}
                >
                  アカウント再開
                </Menu.Item>
              )}
              <Menu.Item onClick={handleExport}>エクスポート</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Stack gap="xl">
          <Box>
            <Text fz="sm" fw="700" mb=".4em">
              アカウント情報
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    アカウントステータス
                  </Table.Th>
                  <Table.Td>
                    <Badge color={user?.statusColor}>
                      {STAUTS_LABEL[user?.approvalStatus ?? 'APPLYING']}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    メールアドレス
                  </Table.Th>
                  <Table.Td>{user?.email}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
          <Box>
            <Text fz="sm" fw="700" mb=".4em">
              店舗情報
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    店舗名
                  </Table.Th>
                  <Table.Td>{user?.shopName}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    請求先会社名
                  </Table.Th>
                  <Table.Td>{user?.companyName}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    店舗電話番号
                  </Table.Th>
                  <Table.Td>{user?.phoneNumber}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    該当の業界
                  </Table.Th>
                  <Table.Td>{user?.businessType}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
          <Box>
            <Text fz="sm" fw="700" mb=".4em">
              店舗住所
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    郵便番号
                  </Table.Th>
                  <Table.Td>{user?.postalCode}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    都道府県
                  </Table.Th>
                  <Table.Td>{user?.prefecture}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    市区町村
                  </Table.Th>
                  <Table.Td>{user?.city}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    その先住所
                  </Table.Th>
                  <Table.Td>{user?.addressLine}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
          <Box>
            <Text fz="sm" fw="700" mb=".4em">
              担当者情報
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    名前
                  </Table.Th>
                  <Table.Td>{user?.name}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    名前（カタカナ）
                  </Table.Th>
                  <Table.Td>{user?.nameKana}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
          <Box>
            <Text fz="sm" fw="700" mb=".4em">
              振り込み情報
            </Text>
            <Table withTableBorder withColumnBorders>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    振込名義
                  </Table.Th>
                  <Table.Td>{user?.transferName}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th w="0" bg="gray.1" style={{ whiteSpace: 'nowrap' }}>
                    振込名義（カタカナ）
                  </Table.Th>
                  <Table.Td>{user?.transferNameKana}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Box>
        </Stack>
      </Modal>
    </>
  )
}
