import { useState, useEffect, useMemo } from 'react'
import {
  ScrollView,
  Box,
  Text,
  Button,
  StatusBar,
  HStack,
  IconButton,
  Spinner,
  Center
} from 'native-base'
import { useRouter } from 'expo-router'
import BottomNavigation from '@/components/BottomNavigation'
import ProductCart from './_components/ProductCart'
import OrderConfirm from './_components/OrderConfirm'
import OrderComplete from './_components/OrderComplete'
import { IconX } from '@tabler/icons-react-native'
import { nativeApi } from '@/lib/trpc'
import type {
  ProductVariant,
  CartItem,
  Product,
  ProductImage
} from '@prisma/client'
import dayjs from 'dayjs'
import { NotReadyText } from '@/components/NotReadyGlassOverlay'
import { getIsReady } from '@/hooks/isReady'

export type OrderStatus = 'CART' | 'ORDER_CONFIRM' | 'ORDER_COMPLETE'
type CartItemType = CartItem & {
  productVariant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

const title = {
  CART: 'カート',
  ORDER_CONFIRM: '注文内容確認',
  ORDER_COMPLETE: '注文完了'
}

export default function CartScreen() {
  const router = useRouter()
  const [memo, setMemo] = useState('')
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('CART')
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)

  // カートの商品一覧
  const [cartLists, setCartLists] = useState<CartItemType[] | undefined>(
    undefined
  )
  const {
    data: cartData,
    error: cartError,
    isLoading
  } = nativeApi.cart.findByUser.useQuery()
  useEffect(() => {
    setCartLists(cartData?.items || [])
  }, [cartData])

  console.log('cartLists:', cartLists)
  const { data: globalSettings } = nativeApi.globalSettings.findFirst.useQuery()

  // 市場が開いているかどうか。
  const isReady = getIsReady(globalSettings?.overrideUsageRestriction ?? false)

  const createOrder = nativeApi.order.create.useMutation()
  const confirmOrder = () => {
    setOrderStatus('ORDER_CONFIRM')
  }
  const submitOrder = async () => {
    setIsLoadingOrder(true)
    try {
      const { error } = await createOrder.mutateAsync()
      if (error) {
        setIsLoadingOrder(false)
        return alert(error)
      }
      setOrderStatus('ORDER_COMPLETE')
    } catch (error) {
      alert('注文に失敗しました。')
      console.error('Error creating order:', error)
    }
    setIsLoadingOrder(false)
  }

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Box h="100%" bg="coolGray.100">
      <Box bg="white" safeAreaTop>
        <StatusBar />
      </Box>
      <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
        <HStack alignItems="center" justifyContent="space-between">
          {cartLists?.length === 0 ? (
            <Box w="16" h="16" />
          ) : (
            <IconButton
              icon={<IconX color="black" size="24" />}
              w="16"
              h="16"
              onPress={() => router.replace('/products/')}
            />
          )}
          <HStack justifyContent="center">
            <Text fontSize="md" color="black" fontWeight="bold">
              {title[orderStatus]}
            </Text>
          </HStack>
          <Box w="16" h="16" />
        </HStack>
      </Box>

      {!isReady ? (
        <NotReadyText />
      ) : (
        <>
          <ScrollView>
            <>
              {orderStatus === 'CART' && (
                <ProductCart
                  setOrderStatus={setOrderStatus}
                  memo={memo}
                  setMemo={setMemo}
                  cartLists={cartLists}
                  setCartLists={setCartLists}
                />
              )}
              {orderStatus === 'ORDER_CONFIRM' && (
                <OrderConfirm memo={memo} cartLists={cartLists} />
              )}
              {orderStatus === 'ORDER_COMPLETE' && <OrderComplete />}
            </>
          </ScrollView>

          {cartLists?.length === 0 ? (
            <BottomNavigation />
          ) : (
            <>
              {orderStatus === 'CART' && (
                <Box bg="white" py="4" px="8" safeAreaBottom>
                  <Button bg="darkBlue.900" onPress={confirmOrder}>
                    <Text fontSize="md" fontWeight="bold" color="text.50">
                      注文を確認する
                    </Text>
                  </Button>
                </Box>
              )}
              {orderStatus === 'ORDER_CONFIRM' && (
                <Box bg="white" py="4" px="8" safeAreaBottom>
                  <Button bg="darkBlue.900" onPress={submitOrder}>
                    <Text fontSize="md" fontWeight="bold" color="text.50">
                      {isLoadingOrder ? (
                        <Spinner size="sm" color="text.50" />
                      ) : (
                        '注文を確定する'
                      )}
                    </Text>
                  </Button>
                </Box>
              )}
              {orderStatus === 'ORDER_COMPLETE' && <BottomNavigation />}
            </>
          )}
        </>
      )}
    </Box>
  )
}
