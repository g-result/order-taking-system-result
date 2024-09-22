import React from 'react'
import { Box, Text, VStack, HStack, ScrollView, Spinner } from 'native-base'
import { useLocalSearchParams, useRouter } from 'expo-router'
import BottomNavigation from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { nativeApi } from '@/lib/trpc'
import type { OrderDetails } from '~/@types/order'
import { convertUnitTypeToString } from '@/app/products/product/_components/variant'
export default function OrderHistoryDetailPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  console.log({ id })
  const order = nativeApi.order.find.useQuery(Number(id)).data
  console.log({ order })
  console.log(order?.items)

  const allQuantity = order?.items?.reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  const requestQuantity =
    order?.items?.reduce(
      (acc, item) => acc + (item.orderType === 'Request' ? item.quantity : 0),
      0
    ) ?? 0

  return (
    <Box flex={1}>
      <Header
        title={'注文履歴詳細'}
        onPressBack={() => router.replace('/my-page/order-history/')}
      />
      <ScrollView bg="coolGray.100">
        <VStack py="6" space="8">
          <VStack space="4">
            <Box px="4">
              <Text fontSize="sm" color="text.900" fontWeight="bold">
                注文履歴
              </Text>
            </Box>
            {!order && <Spinner />}
            {order?.items
              ?.filter((item) => item.orderType === 'Order')
              .map((item) => (
                <VStack key={item.id} px="4" bg="white">
                  <OrderItem item={item} />
                </VStack>
              ))}
          </VStack>
          <VStack space="4">
            <Box px="4">
              <Text fontSize="sm" color="text.900" fontWeight="bold">
                リクエスト商品
              </Text>
            </Box>
            {order?.items
              ?.filter((item) => item.orderType === 'Request')
              .map((item) => (
                <VStack key={item.id} px="4" bg="white">
                  <OrderItem item={item} />
                </VStack>
              ))}
          </VStack>
          {order && (
            <Box py="6" px="4" bg="white">
              <VStack space="2.5">
                <Box>
                  <Text color="text.900" fontSize="sm" fontWeight="bold">
                    商品点数
                  </Text>
                  <Text color="text.900" fontSize="sm">
                    {allQuantity}{' '}
                    {requestQuantity > 0 &&
                      `(リクエスト${requestQuantity}件含む)`}
                  </Text>
                </Box>
                <Box>
                  <Text color="text.900" fontSize="sm" fontWeight="bold">
                    発注メモ
                  </Text>
                  <Text color="text.900" fontSize="sm">
                    {order?.memo}
                  </Text>
                </Box>
              </VStack>
            </Box>
          )}
        </VStack>
      </ScrollView>
      <BottomNavigation />
    </Box>
  )
}
const OrderItem = ({
  item
}: { item: NonNullable<OrderDetails['items']>[0] }) => {
  const displayedUnitTypeName =
    item.pricingType === '魚'
      ? convertUnitTypeToString({
          unitType: item.unitType,
          separateBackBelly: item.separateBackBelly ?? false
        })
      : item.salesFormat
  return (
    <VStack
      pt="6"
      pb="4"
      space="1.5"
      borderBottomColor="muted.200"
      borderBottomWidth="1"
    >
      <Text fontSize="sm" color="text.700">
        {item.productName}
      </Text>
      <HStack alignItems="center" space="1">
        <Text fontSize="sm" color="text.800">
          {displayedUnitTypeName}
        </Text>
        <Text fontSize="md" fontWeight="bold" color="text.900">
          ¥ {item.price}
        </Text>
        <Text fontSize="sm" color="text.800">
          / {item.productUnit}
        </Text>
      </HStack>
      <HStack alignItems="flex-end" justifyContent="space-between">
        <VStack>
          <Box>
            <Text color="text.900">数量 {item.quantity}</Text>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  )
}
