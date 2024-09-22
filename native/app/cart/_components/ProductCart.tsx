import { useState } from 'react'
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Modal,
  TextArea,
  Spinner,
  KeyboardAvoidingView
} from 'native-base'
import OrderProduct from '@/components/OrderProduct'
import FlowSection from './FlowSection'
import { nativeApi } from '@/lib/trpc'
import type {
  ProductVariant,
  Cart,
  CartItem,
  Product,
  ProductImage
} from '@prisma/client'
import type { OrderStatus } from '..'

type CartItemType = CartItem & {
  productVariant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

export default function ProductCart({
  setOrderStatus,
  memo,
  setMemo,
  cartLists,
  setCartLists
}: {
  setOrderStatus: React.Dispatch<React.SetStateAction<OrderStatus>>
  memo: string
  setMemo: (memo: string) => void
  cartLists: CartItemType[] | undefined
  setCartLists: React.Dispatch<React.SetStateAction<CartItemType[] | undefined>>
}) {
  const [showModal, setShowModal] = useState(false)
  const [selectedCartItem, setSelectedCartItem] = useState<CartItemType>()
  const deleteCartItemMutation = nativeApi.cartItem.delete.useMutation()
  const updateCartItemMutation = nativeApi.cartItem.update.useMutation()
  const handleShowModal = (cartItemId: number) => {
    const cartItem = cartLists?.find((item) => item.id === cartItemId)
    setSelectedCartItem(cartItem)
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!selectedCartItem || !cartLists) return
    try {
      const deletedCartItem = await deleteCartItemMutation.mutateAsync(
        selectedCartItem.id
      )
      const newCartLists = cartLists.filter(
        (item) => item.id !== deletedCartItem.id
      )
      setCartLists(newCartLists)
      setShowModal(false)
    } catch (error) {
      console.error('Error deleting to cart:', error)
    }
  }

  const handleQuantityUpdate = async (
    cartItem: CartItemType,
    quantity: string
  ) => {
    const updatedItem = await updateCartItemMutation.mutateAsync({
      id: cartItem.id,
      quantity: Number(quantity)
    })
    const updatedLists = cartLists?.map((item) =>
      item.id === updatedItem.id
        ? {
            ...item,
            quantity: updatedItem.quantity,
            updatedAt: new Date(updatedItem.updatedAt)
          }
        : item
    )
    setCartLists(updatedLists)
  }

  if (!cartLists)
    return (
      <>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </Box>
      </>
    )
  if (cartLists.length === 0)
    return (
      <>
        <Box py="3">
          <HStack py="6" px="4" justifyContent="center" bg="white">
            <Text color="text.900" fontSize="sm">
              カートには何も入っていません
            </Text>
          </HStack>
        </Box>
      </>
    )

  return (
    <>
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={50}>
        <VStack py="3" space="3">
          <FlowSection status={'CART'} />
          {/* 発注メモ */}
          <Box py="6" px="4" bg="white">
            <VStack>
              <Text fontSize="md">発注メモ</Text>
              <Box alignItems="center" w="100%">
                <TextArea
                  autoCompleteType={true}
                  placeholder="発注に関する要望を記入することができます。"
                  value={memo}
                  onChangeText={setMemo}
                  autoCorrect={false}
                  bg="muted.100"
                  fontSize="md"
                  borderWidth="0"
                  maxLength={500}
                />
              </Box>
              <Text fontSize="md" color="text.500" textAlign="right">
                {memo.length}/500
              </Text>
            </VStack>
          </Box>
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
                  <OrderProduct
                    handleShowModal={handleShowModal}
                    cartItem={item}
                    handleQuantityUpdate={handleQuantityUpdate}
                  />
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
                  <OrderProduct
                    handleShowModal={handleShowModal}
                    cartItem={item}
                    handleQuantityUpdate={handleQuantityUpdate}
                  />
                </Box>
              ))}
          </VStack>
        </VStack>
      </KeyboardAvoidingView>
      {/* 削除モーダル */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            <HStack justifyContent="space-between" alignItems="center" w="100%">
              <Text fontSize="md" fontWeight="bold" color="text.900">
                カートから商品を削除しますか？
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <Text fontSize="sm" color="text.900">
              カートから「{selectedCartItem?.productVariant.product.name}
              」を削除しますか？
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="outline"
                color="muted.500"
                borderRadius="4"
                onPress={() => setShowModal(false)}
              >
                <Text color="text.900">キャンセル</Text>
              </Button>
              <Button
                variant="solid"
                bg="error.700"
                borderRadius="4"
                onPress={() => handleDelete()}
              >
                <Text color="text.50" fontWeight="bold">
                  削除
                </Text>
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}
