import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Table,
  Text,
  Textarea
} from '@mantine/core'
import { IconDots } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { modals } from '@mantine/modals'
import type { OrderDetails } from '~/@types/order'
import { clientApi } from '~/lib/trpc/client-api'
import { convertUnitTypeToString } from '~/util'

export default function OrderDetail({
  opened,
  onClose,
  order,
  updateOrderStatus,
  handleExportOrder
}: {
  opened: boolean
  onClose: () => void
  order: OrderDetails
  updateOrderStatus: (
    orderId: number,
    isCancelled: boolean,
    cancelReason: string | null
  ) => void
  handleExportOrder: (order: OrderDetails) => Promise<void>
}) {
  const [isActive, setIsActive] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const undoCancelOrderMutation = clientApi.order.undoCancelOrder.useMutation()
  const cancelOrderMutation = clientApi.order.cancelOrder.useMutation()

  const orderRef = useRef<HTMLDivElement | null>(null)

  const toggleVariant = () => {
    setIsActive(!isActive)
  }
  const handleIconClick = (event: React.MouseEvent) => {
    toggleVariant()
    setMenuOpened((prev) => !prev)
  }
  const handleUndoCancel = () => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">キャンセルを元に戻してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {
        modals.closeAll()
      },
      onConfirm: async () => {
        modals.closeAll()
        try {
          await undoCancelOrderMutation.mutateAsync(order.id)
          updateOrderStatus(order.id, false, null)
        } catch (error) {
          console.error('キャンセルの元に戻す操作に失敗しました', error)
          alert(
            'キャンセルの元に戻す操作に失敗しました。もう一度お試しください。'
          )
        }
        modals.closeAll()
      }
    })
  }
  const handleCancel = () => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">注文をキャンセルしてもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {
        modals.closeAll()
      },
      onConfirm: async () => {
        try {
          await cancelOrderMutation.mutateAsync({
            id: order.id,
            reason: cancelReason
          })
          updateOrderStatus(order.id, true, cancelReason)
        } catch (error) {
          console.error('注文のキャンセルに失敗しました', error)
          alert('注文のキャンセルに失敗しました。もう一度お試しください。')
        }
        modals.closeAll()
      }
    })
  }

  const handleCancelOrder = () => {
    modals.open({
      title: '注文キャンセル',
      centered: true,
      children: (
        <>
          <Textarea
            placeholder="例)重複注文をしたため"
            label="キャンセル理由"
            required
            onChange={(event) => setCancelReason(event.currentTarget.value)}
            styles={{
              label: {
                fontWeight: 700
              },
              input: {
                height: 126
              }
            }}
          />
          <Button
            fullWidth
            mt="lg"
            color="red.6"
            onClick={() => {
              modals.closeAll()
              handleCancel()
            }}
          >
            注文をキャンセルする
          </Button>
        </>
      )
    })
  }

  const [content, setContent] = useState('Hello, SVG to PDF!')
  const generatePDFMutation = clientApi.pdf.generateFromContent.useMutation()
  const sendEmailMutation = clientApi.mail.sendMail.useMutation()

  return (
    <>
      <Modal
        opened={opened}
        c="dark.4"
        onClose={onClose}
        size="640"
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
        <div ref={orderRef}>
          {order.isCancelled ? (
            <Group justify="space-between" mb="md">
              <Badge color="#EF4444">キャンセル</Badge>
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
                  <Menu.Item
                    onClick={() => {
                      onClose()
                      handleUndoCancel()
                    }}
                  >
                    キャンセルを元に戻す
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          ) : (
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
                  <Menu.Item
                    onClick={() => {
                      onClose()
                      handleExportOrder(order)
                    }}
                  >
                    PDFエクスポート
                  </Menu.Item>
                  <Menu.Item
                    color="red.6"
                    onClick={() => {
                      onClose()
                      handleCancelOrder()
                    }}
                  >
                    注文をキャンセルする
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          )}
          <Stack gap="xl">
            <Box>
              <Text fz="sm" fw="700" mb=".4em">
                顧客情報
              </Text>
              <Table withTableBorder withColumnBorders>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      請求先会社名
                    </Table.Th>
                    <Table.Td>{order.user?.companyName}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      店舗名
                    </Table.Th>
                    <Table.Td>{order.user?.shopName}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      店舗電話番号
                    </Table.Th>
                    <Table.Td>{order.user?.phoneNumber}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Box>
            <Box>
              <Text fz="sm" fw="700" mb=".4em">
                注文情報
              </Text>
              <Table withTableBorder withColumnBorders>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      注文番号
                    </Table.Th>
                    <Table.Td>{order?.orderNumber}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      注文商品数
                    </Table.Th>
                    <Table.Td>{order?.orderQuantity}点</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      注文日時
                    </Table.Th>
                    <Table.Td>{order?.orderDate.toLocaleString()}</Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th
                      w="0"
                      bg="gray.1"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      発注メモ
                    </Table.Th>
                    <Table.Td>{order.memo}</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Box>
            <Box>
              <Text fz="sm" fw="700" mb=".4em">
                注文商品情報
              </Text>
              <Table withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th bg="gray.1">No</Table.Th>
                    <Table.Th bg="gray.1">商品名</Table.Th>
                    <Table.Th bg="gray.1">価格</Table.Th>
                    <Table.Th bg="gray.1">注文数</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.items?.map((item, index) => (
                    <Table.Tr key={item.id}>
                      <Table.Td w={39} ta="center">
                        {index + 1}
                      </Table.Td>
                      <Table.Td w={240}>{item.productName}</Table.Td>
                      <Table.Td w={240}>
                        {item.pricingType === '魚' ? (
                          <>
                            {convertUnitTypeToString({
                              unitType: item.unitType,
                              separateBackBelly: item.separateBackBelly ?? false
                            })}
                          </>
                        ) : (
                          <>{item.salesFormat}</>
                        )}{' '}
                        {item.price}円 / {item.productUnit}
                      </Table.Td>
                      <Table.Td w={65}>{item.quantity}点</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </div>
      </Modal>
    </>
  )
}
