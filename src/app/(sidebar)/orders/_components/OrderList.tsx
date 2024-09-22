'use client'
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Group,
  Menu,
  Pagination,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Table,
  Text,
  Textarea,
  Title,
  useMantineTheme
} from '@mantine/core'
import { TextInput, Button } from '@mantine/core'
import { IconDotsVertical, IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import OrderDetail from './OrderDetail'
import { modals } from '@mantine/modals'
import { DatePicker } from '@mantine/dates'
import '@mantine/dates/styles.css'
import 'dayjs/locale/ja'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { clientApi } from '~/lib/trpc/client-api'
import type { OrderDetails, OrderDetailsWithStock } from '~/@types/order'
import { convertOrderInfoToCSV, downloadCSV } from '~/util/exportCSV'
dayjs.locale('ja')
dayjs.extend(isBetween)

export default function OrderList() {
  const theme = useMantineTheme()
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [orderData, setOrderData] = useState<OrderDetails | null>(null)
  const [
    orderDetailModalOpened,
    { open: orderDetailModalOpen, close: orderDetailModalClose }
  ] = useDisclosure(false)

  const [searchType, setSearchType] = useState('single')
  const [singleDate, setSingleDate] = useState<Date | null>(null)
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([
    null,
    null
  ])
  const [opened, setOpened] = useState(false)
  const [orders, setOrders] = useState<OrderDetailsWithStock[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 100
  const [cancelReason, setCancelReason] = useState('')
  const [cancelFilter, setCancelFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilterLabel, setDateFilterLabel] = useState('全ての注文日時')
  const [isExportButtonDisabled, setIsExportButtonDisabled] = useState(true)
  const [exportButtonLabel, setExportButtonLabel] = useState('CSVエクスポート')

  const fetchOrderData = clientApi.order.findAll.useQuery()
  const undoCancelOrderMutation = clientApi.order.undoCancelOrder.useMutation()
  const cancelOrderMutation = clientApi.order.cancelOrder.useMutation()
  const generateOrderInfoMutation =
    clientApi.pdf.generateOrderInfo.useMutation()

  const updateOrderStatus = (
    orderId: number,
    isCancelled: boolean,
    cancelReason: string | null = null
  ) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, isCancelled, cancelReason } : order
    )
    setOrders(updatedOrders)
  }

  useEffect(() => {
    if (fetchOrderData.isSuccess && fetchOrderData.data) {
      const records = fetchOrderData.data.map((record) => ({
        ...record,
        id: record.id,
        orderNumber: record.orderNumber,
        shopName: record.user ? record.user.shopName : '',
        orderQuantity: record.orderQuantity,
        orderDate: record.orderDate,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        user: record.user
          ? {
              ...record.user,
              createdAt: record.user.createdAt,
              updatedAt: record.user.updatedAt,
              lastLogin: record.user.lastLogin ? record.user.lastLogin : null
            }
          : undefined,
        items: record.items
          ? record.items.map((item) => ({
              ...item,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          : []
      }))
      setOrders(records)
      setTotal(fetchOrderData.data.length)
      setTotalPages(Math.ceil(fetchOrderData.data.length / pageSize))
    } else {
      setOrders([])
    }
  }, [fetchOrderData.isSuccess, fetchOrderData.data])

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentOrders = orders.slice(startIndex, endIndex)

  // キャンセル有無で絞り込み
  useEffect(() => {
    if (fetchOrderData.isSuccess && fetchOrderData.data) {
      let filteredOrders = fetchOrderData.data
      if (cancelFilter === 'exclude-cancelled') {
        filteredOrders = filteredOrders.filter((order) => !order.isCancelled)
      } else if (cancelFilter === 'only-cancelled') {
        filteredOrders = filteredOrders.filter((order) => order.isCancelled)
      }
      const records = filteredOrders.map((record) => ({
        ...record,
        id: record.id,
        orderNumber: record.orderNumber,
        shopName: record.user ? record.user.shopName : '',
        orderQuantity: record.orderQuantity,
        orderDate: record.orderDate,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        user: record.user
          ? {
              ...record.user,
              createdAt: record.user.createdAt,
              updatedAt: record.user.updatedAt,
              lastLogin: record.user.lastLogin ? record.user.lastLogin : null
            }
          : undefined,
        items: record.items
          ? record.items.map((item) => ({
              ...item,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          : []
      }))
      setOrders(records)
      setTotal(filteredOrders.length)
      setTotalPages(Math.ceil(filteredOrders.length / pageSize))
      if (page > Math.ceil(filteredOrders.length / pageSize)) {
        setPage(1)
      }
    } else {
      setOrders([])
    }
  }, [fetchOrderData.isSuccess, fetchOrderData.data, cancelFilter])

  // 店名・商品名で絞り込み
  useEffect(() => {
    if (fetchOrderData.isSuccess && fetchOrderData.data) {
      const filteredOrders = fetchOrderData.data.filter(
        (order) =>
          order.user?.shopName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.items?.some((item) =>
            item.productName.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      const records = filteredOrders.map((record) => ({
        ...record,
        id: record.id,
        orderNumber: record.orderNumber,
        shopName: record.user ? record.user.shopName : '',
        orderQuantity: record.orderQuantity,
        orderDate: record.orderDate,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        user: record.user
          ? {
              ...record.user,
              createdAt: record.user.createdAt,
              updatedAt: record.user.updatedAt,
              lastLogin: record.user.lastLogin ? record.user.lastLogin : null
            }
          : undefined,
        items: record.items
          ? record.items.map((item) => ({
              ...item,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          : []
      }))
      setOrders(records)
      setTotal(filteredOrders.length)
      setTotalPages(Math.ceil(filteredOrders.length / pageSize))
      if (page > Math.ceil(filteredOrders.length / pageSize)) {
        setPage(1)
      }
    } else {
      setOrders([])
    }
  }, [fetchOrderData.isSuccess, fetchOrderData.data, searchQuery])

  const toggleVariant = (id: number) => {
    setActiveRow(activeRow === id ? null : id)
  }

  const handleRowClick = (order: OrderDetails) => {
    setOrderData({ ...order })
    orderDetailModalOpen()
  }

  const handleMenuClose = () => {
    setActiveRow(null)
  }

  const handleUndoCancel = (orderId: number) => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: (
        <Text size="sm" c="dark.4">
          キャンセルを元に戻してもよろしいですか？
        </Text>
      ),
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {},
      onConfirm: async () => {
        try {
          await undoCancelOrderMutation.mutateAsync(orderId)
          const updatedOrders = orders.map((order) =>
            order.id === orderId ? { ...order, isCancelled: false } : order
          )
          setOrders(updatedOrders)
          modals.closeAll()
        } catch (error) {
          console.error('キャンセルを元に戻す操作に失敗しました', error)
          alert(
            'キャンセルを元に戻す操作に失敗しました。もう一度お試しください。'
          )
        }
      }
    })
  }

  /**
   * 日次CSVエクスポート
   * 当日の9:00以降は、前日の15:00〜当日の9:00までに発注があったデータをエクスポート
   * 9:00以前は、前日の15:00~その時点までのデータをエクスポート
   */
  const handleExport = () => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: (
        <Text size="sm" c="dark.4">
          {dayjs().hour() >= 9
            ? `${dayjs()
                .subtract(1, 'day')
                .format('YYYY/MM/DD')} 15:00 ~ ${dayjs().format(
                'YYYY/MM/DD'
              )} 9:00`
            : `${dayjs()
                .subtract(1, 'day')
                .format('YYYY/MM/DD')} 15:00 ~ ${dayjs().format(
                'YYYY/MM/DD HH:mm'
              )}`}
          の注文をエクスポートしてもよろしいですか？
        </Text>
      ),
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {},
      onConfirm: () => {
        const startDate =
          dayjs().hour() >= 9
            ? dayjs().subtract(1, 'day').hour(15).minute(0).second(0)
            : dayjs().subtract(1, 'day').hour(15).minute(0).second(0)
        const endDate =
          dayjs().hour() >= 9 ? dayjs().hour(9).minute(0).second(0) : dayjs()

        const ordersToExport = orders.filter((order) =>
          dayjs(order.orderDate).isBetween(startDate, endDate)
        )
        const csvData = convertOrderInfoToCSV(ordersToExport)
        const csvTitle = `${startDate.format('YYYYMMDD_HHmm')}_${endDate.format(
          'YYYYMMDD_HHmm'
        )}_orders.csv`
        downloadCSV(csvData, csvTitle)
      }
    })
  }

  // 注文を選択してCSVエクスポート
  const handleExportOrdersToCSV = (orderIds: number[]) => {
    const ordersToExport = orders.filter((order) => {
      const orderDate = dayjs(order.orderDate)
      const isExcludedTime = orderDate.hour() >= 9 && orderDate.hour() < 15
      return orderIds.includes(order.id) && !isExcludedTime
    })
    const csvData = convertOrderInfoToCSV(ordersToExport)

    let csvTitle = 'selected_orders.csv'
    if (singleDate) {
      const startDate = dayjs(singleDate)
        .subtract(1, 'day')
        .hour(15)
        .minute(0)
        .second(0)
      const endDate = dayjs(singleDate).hour(9).minute(0).second(0)
      csvTitle = `${startDate.format('YYYYMMDD_HHmm')}_${endDate.format(
        'YYYYMMDD_HHmm'
      )}_orders.csv`
    } else if (rangeDate[0] && rangeDate[1]) {
      const startDate = dayjs(rangeDate[0])
        .subtract(1, 'day')
        .hour(15)
        .minute(0)
        .second(0)
      const endDate = dayjs(rangeDate[1]).hour(9).minute(0).second(0)
      csvTitle = `${startDate.format('YYYYMMDD_HHmm')}_${endDate.format(
        'YYYYMMDD_HHmm'
      )}_orders.csv`
    }
    downloadCSV(csvData, csvTitle)
  }
  useEffect(() => {
    if (searchType === 'single') {
      setRangeDate([null, null])
    } else if (searchType === 'range') {
      setSingleDate(null)
    }
  }, [searchType])

  // PDFエクスポート
  const handleExportOrder = async (order: OrderDetails) => {
    try {
      const response = await generateOrderInfoMutation.mutateAsync({
        content: JSON.stringify(order)
      })
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `order_${order.orderNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDFのエクスポートに失敗しました', error)
      alert('PDFのエクスポートに失敗しました。もう一度お試しください。')
    }
  }

  const handleCancelOrder = (orderId: number) => {
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
              handleCancel(orderId)
            }}
          >
            注文をキャンセルする
          </Button>
        </>
      )
    })
  }

  const handleCancel = (orderId: number) => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: (
        <Text size="sm" c="dark.4">
          注文をキャンセルしてもよろしいですか？
        </Text>
      ),
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await cancelOrderMutation.mutateAsync({
            id: orderId,
            reason: cancelReason
          })
          const updatedOrders = orders.map((order) =>
            order.id === orderId
              ? { ...order, isCancelled: true, cancelReason }
              : order
          )
          setOrders(updatedOrders)
        } catch (error) {
          console.error('注文のキャンセルに失敗しました', error)
          alert('注文のキャンセルに失敗しました。もう一度お試しください。')
        } finally {
          modals.closeAll()
        }
      }
    })
  }

  const handleDateFilter = () => {
    if (fetchOrderData.isSuccess && fetchOrderData.data) {
      let filteredOrders = fetchOrderData.data
      if (dateFilterLabel === '全ての注文日時') {
        setOrders(filteredOrders)
        setTotal(filteredOrders.length)
        setTotalPages(Math.ceil(filteredOrders.length / pageSize))
        setIsExportButtonDisabled(true)
        setExportButtonLabel('CSVエクスポート')
        return
      }
      if (searchType === 'single' && singleDate) {
        const startDate = dayjs(singleDate)
          .subtract(1, 'day')
          .hour(15)
          .minute(0)
          .second(0)
        const endDate = dayjs(singleDate).hour(9).minute(0).second(0)
        filteredOrders = filteredOrders.filter((order) =>
          dayjs(order.orderDate).isBetween(startDate, endDate)
        )
        setExportButtonLabel(
          `${dayjs(singleDate).format('YYYY/MM/DD')}のCSVを出力`
        )
      } else if (searchType === 'range' && rangeDate[0] && rangeDate[1]) {
        const startDate = dayjs(rangeDate[0])
          .subtract(1, 'day')
          .hour(15)
          .minute(0)
          .second(0)
        const endDate = dayjs(rangeDate[1]).hour(9).minute(0).second(0)
        filteredOrders = filteredOrders.filter((order) =>
          dayjs(order.orderDate).isBetween(startDate, endDate)
        )
        setExportButtonLabel(
          `${dayjs(rangeDate[0]).format('YYYY/MM/DD')} 〜 ${dayjs(
            rangeDate[1]
          ).format('YYYY/MM/DD')}のCSVを出力`
        )
      } else if (searchType === 'range' && rangeDate[0]) {
        setExportButtonLabel('CSVエクスポート')
      }
      const records = filteredOrders.map((record) => ({
        ...record,
        id: record.id,
        orderNumber: record.orderNumber,
        shopName: record.user ? record.user.shopName : '',
        orderQuantity: record.orderQuantity,
        orderDate: record.orderDate,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        user: record.user
          ? {
              ...record.user,
              createdAt: record.user.createdAt,
              updatedAt: record.user.updatedAt,
              lastLogin: record.user.lastLogin ? record.user.lastLogin : null
            }
          : undefined,
        items: record.items
          ? record.items.map((item) => ({
              ...item,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          : []
      }))
      setOrders(records)
      setTotal(filteredOrders.length)
      setTotalPages(Math.ceil(filteredOrders.length / pageSize))
      setIsExportButtonDisabled(false)
    }
  }

  useEffect(() => {
    handleDateFilter()
  }, [singleDate, rangeDate, searchType])

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
  }

  return (
    <>
      {orderData && (
        <OrderDetail
          opened={orderDetailModalOpened}
          onClose={orderDetailModalClose}
          order={orderData}
          updateOrderStatus={updateOrderStatus}
          handleExportOrder={handleExportOrder}
        />
      )}
      <Box>
        <Flex justify="space-between" mb={15}>
          <Title order={2} fz="18">
            注文一覧
          </Title>
          <Group>
            <TextInput
              w={432}
              placeholder="店名・商品名で検索"
              styles={{
                input: {
                  background: '#F8F9FA'
                }
              }}
              leftSection={
                <IconSearch size={20} stroke={2} color={theme.colors.gray[5]} />
              }
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
            <Button variant="outline" fw="400" onClick={handleExport}>
              日次CSVエクスポート
            </Button>
          </Group>
        </Flex>
        <Group justify="space-between" mb={10}>
          <Group>
            <Button
              disabled={isExportButtonDisabled}
              onClick={() =>
                handleExportOrdersToCSV(orders.map((order) => order.id))
              }
            >
              {exportButtonLabel}
            </Button>
            <Popover
              width={300}
              position="bottom-start"
              withArrow
              opened={opened}
              onChange={setOpened}
              onClose={() => {
                handleDateFilter()
              }}
            >
              <Popover.Target>
                <Button
                  variant="default"
                  fw="400"
                  onClick={() => {
                    setOpened((o) => !o)
                    if (!opened) {
                      setDateFilterLabel('全ての注文日時')
                    }
                    handleDateFilter()
                  }}
                  styles={(theme) => ({
                    root: {
                      borderColor: theme.colors.gray[4],
                      color: theme.colors.gray[5]
                    }
                  })}
                >
                  {dateFilterLabel}
                </Button>
              </Popover.Target>
              <Popover.Dropdown bg="gray.0">
                <RadioGroup value={searchType} onChange={setSearchType}>
                  <Group mb="sm">
                    <Radio value="single" label="単一検索" size="xs" />
                    <Radio value="range" label="範囲検索" size="xs" />
                  </Group>
                </RadioGroup>
                {searchType === 'single' && (
                  <Box
                    bg="#fff"
                    py="xs"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}
                  >
                    <DatePicker
                      locale="ja"
                      value={singleDate}
                      onChange={(date) => {
                        setSingleDate(date)
                        setDateFilterLabel(
                          date
                            ? dayjs(date).format('YYYY/MM/DD')
                            : '全ての注文日時'
                        )
                        setOpened(false)
                      }}
                    />
                  </Box>
                )}
                {searchType === 'range' && (
                  <Box
                    bg="#fff"
                    py="xs"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #E9ECEF'
                    }}
                  >
                    <DatePicker
                      locale="ja"
                      type="range"
                      value={rangeDate}
                      onChange={(dates) => {
                        setRangeDate(dates)
                        if (dates?.[0]) {
                          setDateFilterLabel(
                            `${dayjs(dates[0]).format('YYYY/MM/DD')} 〜`
                          )
                        } else {
                          setDateFilterLabel('全ての注文日時')
                        }
                        if (dates?.[0] && dates?.[1]) {
                          setOpened(false)
                        }
                      }}
                    />
                  </Box>
                )}
              </Popover.Dropdown>
            </Popover>
            <Select
              w={165}
              placeholder="キャンセルの有無"
              value={cancelFilter === 'all' ? null : cancelFilter}
              onChange={(value) => setCancelFilter(value ?? 'all')}
              data={[
                { value: 'all', label: '全ての注文' },
                { value: 'exclude-cancelled', label: 'キャンセルを除く' },
                { value: 'only-cancelled', label: 'キャンセルのみ' }
              ]}
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
              <Table.Th w={275}>注文番号</Table.Th>
              <Table.Th w={275}>店舗名</Table.Th>
              <Table.Th w={275}>注文日時</Table.Th>
              <Table.Th w={275}>注文商品数</Table.Th>
              <Table.Th w={44} ta="center">
                操作
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {currentOrders.map((order) => (
              <Table.Tr
                key={order.id}
                style={{
                  color: order.isCancelled ? '#A6A7AB' : 'inherit',
                  cursor: 'pointer'
                }}
                onClick={() => handleRowClick(order)}
              >
                <Table.Td>
                  <Group gap="7">
                    {order.isCancelled && (
                      <Badge color="gray.5">キャンセル</Badge>
                    )}
                    {order.orderNumber}
                  </Group>
                </Table.Td>
                <Table.Td>{order.user?.shopName}</Table.Td>
                <Table.Td>{order.orderDate.toLocaleString()}</Table.Td>
                <Table.Td>{order.orderQuantity}点</Table.Td>
                <Table.Td onClick={(event) => event.stopPropagation()}>
                  <Flex justify="center">
                    <Menu
                      withArrow
                      position="bottom-end"
                      shadow="md"
                      onClose={handleMenuClose}
                    >
                      <Menu.Target>
                        <ActionIcon
                          variant={
                            activeRow === order.id ? 'blue.6' : 'transparent'
                          }
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleVariant(order.id)
                          }}
                        >
                          <IconDotsVertical
                            size={20}
                            stroke={2}
                            color={activeRow === order.id ? '#fff' : '#354052'}
                          />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>操作を選択してください</Menu.Label>
                        {order.isCancelled ? (
                          <>
                            <Menu.Item
                              onClick={() => handleUndoCancel(order.id)}
                            >
                              キャンセルを元に戻す
                            </Menu.Item>
                          </>
                        ) : (
                          <>
                            <Menu.Item onClick={() => handleExportOrder(order)}>
                              PDFエクスポート
                            </Menu.Item>
                            <Menu.Item
                              color="red.6"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              注文をキャンセルする
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Flex>
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
