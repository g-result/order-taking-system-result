import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Image,
  Button,
  VStack,
  Icon,
  HStack,
  Select,
  Input
} from 'native-base'
import { IconChevronDown, IconCheck } from '@tabler/icons-react-native'
import type {
  ProductVariant,
  Product,
  ProductImage,
  CartItem
} from '@prisma/client'
import { convertUnitTypeToString } from '@/app/products/product/_components/variant'

type CartItemType = CartItem & {
  productVariant: ProductVariant & {
    product: Product & {
      images: ProductImage[]
    }
  }
}

export default function OrderProduct({
  handleShowModal = undefined,
  cartItem,
  handleQuantityUpdate = undefined
}: {
  handleShowModal?: (cartItemId: number) => void
  cartItem: CartItemType
  handleQuantityUpdate?: (cartItem: CartItemType, quantity: string) => void
}) {
  const [itemQuantity, setItemQuantity] = useState<string>(
    String(cartItem.quantity)
  )
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [customQuantity, setCustomQuantity] = useState<number | null>(
    cartItem.quantity > 10 ? cartItem.quantity : null
  )
  const [error, setError] = useState<string | null>(null)

  const separateBackBelly = cartItem?.productVariant?.product?.separateBackBelly
  const displayedUnitTypeName = convertUnitTypeToString({
    unitType: cartItem.productVariant.unitType,
    separateBackBelly
  })

  useEffect(() => {
    try {
      if (cartItem?.productVariant?.product?.images?.length > 0) {
        setImageUrl(cartItem.productVariant.product.images[0].url)
      }
    } catch (error) {
      console.error('Error in fetchImageUrl:', error)
    }
  }, [])

  const changeQuantity = async (quantity: string) => {
    if (!handleQuantityUpdate) return
    try {
      handleQuantityUpdate(cartItem, quantity)
      setItemQuantity(quantity)
    } catch (error) {
      console.error('Error in changeQuantity:', error)
    }
  }

  // 数量選択のリスト。在庫が0の場合はリクエスト用にDEFAULT_QUANTITY_LISTを表示。在庫に応じて選択できるようにする。
  const DEFAULT_QUANTITY_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const selectedVariantQuantity = cartItem.productVariant.quantity
  const isRequestOrder = selectedVariantQuantity === 0
  const quantityList = isRequestOrder
    ? [...DEFAULT_QUANTITY_LIST, '数量を入力する']
    : selectedVariantQuantity < 10
      ? Array.from({ length: selectedVariantQuantity }, (_, i) => i + 1)
      : [...DEFAULT_QUANTITY_LIST, '数量を入力する']
  // 自由入力された数量をリストに追加
  if (customQuantity !== null && !quantityList.includes(customQuantity)) {
    quantityList.push(customQuantity)
  }

  const handleQuantityChange = (value: string) => {
    if (value === '数量を入力する') {
      setCustomQuantity(1)
    } else {
      setCustomQuantity(null)
      setItemQuantity(value)
      changeQuantity(value)
    }
  }

  const handleCustomQuantityChange = (value: string) => {
    const quantity = Number(value)
    if (!isRequestOrder && quantity > selectedVariantQuantity) {
      setError('在庫が足りません')
    } else {
      setError(null)
      setCustomQuantity(quantity)
      changeQuantity(String(quantity))
    }
  }

  return (
    <HStack space="6">
      <Box w="93" h="93" bg="coolGray.100" borderRadius="4">
        <Image
          source={{
            uri: imageUrl
          }}
          alt="画像の説明"
          height="100%"
          width="100%"
        />
      </Box>
      <VStack space="1.5" w="70%">
        <VStack>
          <Text fontSize="sm" color="text.700">
            {cartItem.productVariant.product.name}
          </Text>
          <Text fontSize="xs" color="text.500">
            {cartItem.productVariant.product.origin}
          </Text>
          <HStack alignItems="center" space="1">
            <Text fontSize="sm" color="text.800">
              {cartItem.productVariant.product.pricingType === '魚'
                ? displayedUnitTypeName
                : cartItem.productVariant.salesFormat}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="text.900">
              ¥ {cartItem.productVariant.price.toLocaleString()}
            </Text>
            <Text fontSize="sm" color="text.800">
              /{cartItem.productVariant.product.unit}
            </Text>
          </HStack>
        </VStack>
        <HStack alignItems="flex-end" justifyContent="space-between">
          <VStack>
            <Box>
              <Text color="text.900">
                数量{!handleShowModal && `: ${itemQuantity}`}
              </Text>
            </Box>
            {handleShowModal && (
              <>
                <Select
                  _actionSheetBody={{ scrollEnabled: false }}
                  selectedValue={
                    customQuantity !== null
                      ? String(customQuantity)
                      : itemQuantity
                  }
                  w="83"
                  size="sm"
                  accessibilityLabel="Choose Service"
                  placeholder="数量を選択"
                  dropdownIcon={
                    <Icon
                      mr="2"
                      as={<IconChevronDown size={20} />}
                      color="muted.500"
                    />
                  }
                  _selectedItem={{
                    endIcon: (
                      <Icon as={<IconCheck size={20} />} color="muted.500" />
                    )
                  }}
                  mt={1}
                  onValueChange={(quantity) => handleQuantityChange(quantity)}
                >
                  {quantityList.map((quantity) => (
                    <Select.Item
                      key={quantity}
                      label={String(quantity)}
                      value={String(quantity)}
                    />
                  ))}
                </Select>
                {customQuantity !== null && (
                  <Box mt={2}>
                    <Input
                      placeholder="数量を入力"
                      keyboardType="numeric"
                      value={String(customQuantity)}
                      onChangeText={handleCustomQuantityChange}
                      autoFocus
                      w="100%"
                      variant="outline"
                    />
                    {error && (
                      <Text color="red.500" mt={1}>
                        {error}
                      </Text>
                    )}
                  </Box>
                )}
              </>
            )}
          </VStack>
          {handleShowModal && (
            <Button
              variant="unstyled"
              onPress={() => handleShowModal(cartItem.id)}
            >
              <Text color="text.900" textDecorationLine="underline">
                削除する
              </Text>
            </Button>
          )}
        </HStack>
      </VStack>
    </HStack>
  )
}
