import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
  Icon
} from 'native-base'
import { IconChevronRight } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import BottomNavigation from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { nativeApi } from '@/lib/trpc'
import dayjs from '@/lib/dayjs'

export default function OrderHistoryPage() {
  const router = useRouter()
  const orders = nativeApi.order.mine.useQuery().data
  const pressOrder = (id: number) => {
    router.replace(`/my-page/order-history/${id}`)
  }

  return (
    <Box flex={1}>
      <ScrollView bg="coolGray.100">
        <Header
          title={'注文履歴一覧'}
          onPressBack={() => router.replace('/my-page/')}
        />

        <VStack py="6" space="4">
          <VStack>
            {orders?.map((order, index) => (
              <Pressable
                key={order.id}
                px="4"
                bg="white"
                onPress={() => pressOrder(order.id)}
              >
                <HStack
                  py="5"
                  justifyItems="center"
                  justifyContent="space-between"
                  borderBottomColor="muted.200"
                  borderBottomWidth={index === orders.length - 1 ? '0' : '1'}
                >
                  <Text>
                    {dayjs(order.orderDate).format('YYYY/MM/DD (ddd) HH:mm')}
                    発注分
                  </Text>
                  <Icon
                    as={<IconChevronRight size="24" strokeWidth={1} />}
                    color="muted.500"
                  />
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
      <BottomNavigation />
    </Box>
  )
}
