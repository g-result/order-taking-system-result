import { Box, Text, VStack } from 'native-base'
import FlowSection from './FlowSection'
import OrderProduct from '@/components/OrderProduct'
import type {
  ProductVariant,
  CartItem,
  Product,
  ProductImage
} from '@prisma/client'

type CartItemType = CartItem & {
  productVariant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

export default function OrderConfirm({
  memo,
  cartLists
}: { memo: string; cartLists: CartItemType[] | undefined }) {
  const totalQuantity = cartLists?.reduce(
    (total, item) => total + item.quantity,
    0
  )
  const requestQuantity = cartLists?.reduce(
    (total, item) => total + (item.orderType === 'Request' ? item.quantity : 0),
    0
  )
  return (
    <>
      <VStack py="3" space="3">
        <FlowSection status={'ORDER_CONFIRM'} />
        {/* 注文商品 */}
        <VStack py="6" px="4" space="4" bg="white">
          <Text fontSize="md" color="text.900" fontWeight="bold">
            注文商品
          </Text>
          {cartLists
            ?.filter((item) => item.orderType === 'Order')
            .map((item, index) => (
              <Box
                key={item.id}
                borderBottomWidth={index < cartLists.length - 1 ? 1 : 0}
                borderBottomColor={
                  index < cartLists.length - 1 ? 'muted.300' : 'transparent'
                }
                pb={index < cartLists.length - 1 ? 4 : 0}
              >
                <OrderProduct cartItem={item} key={item.id} />
              </Box>
            ))}
        </VStack>
        {/* リクエスト商品 */}
        <VStack py="6" px="4" space="4" bg="white">
          <Text fontSize="md" color="text.900" fontWeight="bold">
            リクエスト商品
          </Text>
          {cartLists
            ?.filter((item) => item.orderType === 'Request')
            .map((item, index) => (
              <Box
                key={item.id}
                borderBottomWidth={index < cartLists.length - 1 ? 1 : 0}
                borderBottomColor={
                  index < cartLists.length - 1 ? 'muted.300' : 'transparent'
                }
                pb={index < cartLists.length - 1 ? 4 : 0}
              >
                <OrderProduct cartItem={item} key={item.id} />
              </Box>
            ))}
        </VStack>

        <Box py="6" px="4" bg="white">
          <VStack space="2.5">
            <Box>
              <Text fontSize="sm" color="text.900" fontWeight="bold">
                商品点数
              </Text>
              <Text fontSize="sm" color="text.900">
                {totalQuantity}件
                {requestQuantity && requestQuantity > 0
                  ? `(リクエスト${requestQuantity}件含む)`
                  : ''}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="text.900" fontWeight="bold">
                発注メモ
              </Text>
              <Text fontSize="sm" color="text.900">
                {memo}
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </>
  )
}
