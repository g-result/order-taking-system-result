import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Box,
  Text,
  Button,
  VStack,
  StatusBar,
  Icon,
  HStack,
  SimpleGrid,
  Actionsheet,
  useDisclose,
  Modal,
  Radio,
  ScrollView,
  IconButton,
  Spinner,
  Input
} from 'native-base'
import {
  IconChevronLeft,
  IconCircleCheckFilled
} from '@tabler/icons-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import {
  KeyboardAvoidingView,
  type ScrollView as ScrollViewType,
  type View as ViewType
} from 'react-native'
import type { ProductImage } from '@prisma/client'
import { nativeApi } from '@/lib/trpc'
import ProductCard from '@/components/ProductCard'
import BottomNavigation from '@/components/BottomNavigation'
import ProductImages from './_components/ProductImages'
import ProductDetails from './_components/ProductDetails'
import Variant from './_components/variant'

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const {
    data: product,
    error: productError,
    isLoading: isLoadingProduct
  } = nativeApi.product.find.useQuery(Number(id))
  const addCartItemMutation = nativeApi.cartItem.create.useMutation()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [selected, setSelected] = useState<number>(0)
  const [selectedValue, setSelectedValue] = useState<number>(1)
  const [images, setImages] = useState<ProductImage[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showCustomQuantityInput, setShowCustomQuantityInput] = useState(false)
  const [customQuantity, setCustomQuantity] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const { isOpen, onOpen, onClose } = useDisclose(false)
  const scrollViewRef = useRef<ScrollViewType>(null)
  const relatedProductsRef = useRef<ViewType>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const unitTypeOrder = {
    WHOLE: 1,
    HALF_BODY: 2,
    QUATER_BACK: 3,
    QUATER_BELLY: 4
  }

  useEffect(() => {
    const fetchImageUrl = async () => {
      const images = product?.images.map((image) => {
        return { ...image, url: image.url }
      })

      setImages(images || [])
    }
    fetchImageUrl()
  }, [product])

  const onCart = async () => {
    if (customQuantity <= 0 && selectedValue <= 0) {
      alert('数量を入力してください')
      return
    }
    setIsAddingToCart(true)
    await handleAddToCart()
    setIsAddingToCart(false)
  }

  async function handleAddToCart() {
    if (product) {
      try {
        const variant = product.variants[selected]
        const isRequest = variant.quantity === 0
        const quantityToAdd =
          customQuantity > 0 ? customQuantity : selectedValue
        if (!isRequest && variant.quantity < quantityToAdd) {
          alert('在庫が足りません')
          return
        }
        await addCartItemMutation.mutateAsync({
          productVariantId: product.variants[selected].id,
          quantity: quantityToAdd,
          orderType: isRequest ? 'Request' : 'Order'
        })
        setShowModal(true)
      } catch (error) {
        console.error('Error adding to cart:', error)
      }
    }
    onClose()
  }

  const recommendTagIds = product?.recommendTags.map(
    (tag) => tag.recommendTagId
  )

  const { data: products, isLoading: isLoadingProducts } =
    nativeApi.product.listProductsByRecommendTag.useQuery(recommendTagIds || [])

  const scrollToRelatedProducts = () => {
    if (relatedProductsRef.current && scrollViewRef.current) {
      relatedProductsRef.current.measure((fx, fy) => {
        scrollViewRef.current?.scrollTo({ y: fy, animated: true })
      })
    }
  }
  const selectedVariant = product?.variants[selected]
  const isRequest = selectedVariant?.quantity === 0

  // 数量選択のリスト。在庫が0の場合はリクエスト用にDEFAULT_QUANTITY_LISTを表示。在庫に応じて選択できるようにする。
  const DEFAULT_QUANTITY_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const selectedVariantQuantity = selectedVariant?.quantity ?? 0
  const isRequestOrder = selectedVariantQuantity === 0
  const quantityList = isRequestOrder
    ? [...DEFAULT_QUANTITY_LIST, '数量を入力する']
    : selectedVariantQuantity < 10
      ? Array.from({ length: selectedVariantQuantity }, (_, i) => i + 1)
      : [...DEFAULT_QUANTITY_LIST, '数量を入力する']

  const handleQuantityChange = (value: string) => {
    if (value === '数量を入力する') {
      setShowCustomQuantityInput(true)
    } else {
      setSelectedValue(Number(value))
    }
  }

  useEffect(() => {
    if (selectedValue !== 0) {
      setCustomQuantity(0)
    }
  }, [selectedValue])

  // 入力した数量の在庫が無い場合にアラートを表示する
  const handleCustomQuantityChange = (value: string) => {
    const quantity = Number(value)
    if (!isRequestOrder && quantity > selectedVariantQuantity) {
      setError('在庫が足りません')
    } else {
      setError(null)
      setCustomQuantity(quantity)
    }
  }

  const isLoading = isLoadingProducts || isLoadingProduct
  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <>
      <ScrollView ref={scrollViewRef}>
        <Box safeAreaTop>
          <StatusBar />
        </Box>
        <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
          <HStack alignItems="center" justifyContent="space-between">
            <IconButton
              icon={<IconChevronLeft size="24" color="black" />}
              w="16"
              h="16"
              onPress={() => router.replace('/products/')}
              color="black"
            />
            <Text fontSize="md" color="black" fontWeight="bold">
              {product?.name}
            </Text>
            <Box h="16" w="16" />
          </HStack>
        </Box>
        <VStack space="3" bg="coolGray.100">
          <Box bg="white">
            <ProductImages
              categories={product?.categories ?? []}
              images={images}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
            {product && <ProductDetails product={product} />}
          </Box>
          <VStack space="4" py="6" px="4" bg="white">
            <Text fontSize="md" color="black" fontWeight="bold">
              商品説明
            </Text>
            <Text fontSize="sm" color="black">
              {product?.description}
            </Text>
          </VStack>
          <VStack space="5" py="6" px="4" bg="white">
            <Radio.Group
              name="cardRadioGroup"
              accessibilityLabel="select option"
              value={String(selected)}
              onChange={(nextValue) => setSelected(Number(nextValue))}
              space={4}
            >
              {product?.variants.map((variant, index) => (
                <Variant
                  product={product}
                  variant={variant}
                  separateBackBelly={product.separateBackBelly}
                  selected={selected}
                  setSelected={setSelected}
                  index={index}
                  key={variant.id}
                />
              ))}
            </Radio.Group>
            <Button p="4" bg="darkBlue.900" borderRadius="4" onPress={onOpen}>
              <Text color="text.50" fontSize="md" fontWeight="bold">
                数量を選択する
              </Text>
            </Button>
          </VStack>
          <VStack px="4" py="6" space="4" bg="white" ref={relatedProductsRef}>
            <HStack justifyContent="center">
              <Text color="black" fontSize="md" fontWeight="bold">
                関連商品
              </Text>
            </HStack>
            <Box>
              <SimpleGrid columns={2} space={4}>
                {products?.map((product) => {
                  return <ProductCard product={product} key={product.id} />
                })}
              </SimpleGrid>
            </Box>
          </VStack>
        </VStack>
      </ScrollView>
      <BottomNavigation />
      <Actionsheet isOpen={isOpen} onClose={onClose} width="100%" px="0">
        <Actionsheet.Content width="100%" px="0">
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={150}
          >
            <ScrollView width="100%">
              <Radio.Group
                name="exampleGroup"
                accessibilityLabel="Pick a number"
                value={selectedValue.toString()}
                onChange={(nextValue) => handleQuantityChange(nextValue)}
                pb={50}
              >
                {quantityList.map((value) => (
                  <Actionsheet.Item
                    key={value}
                    width="100%"
                    borderBottomColor="muted.400"
                    borderBottomWidth="1"
                    p="6"
                  >
                    <HStack width="100%" space={3}>
                      <Radio
                        value={value.toString()}
                        aria-label={`Number ${value}`}
                      >
                        <HStack
                          alignItems="center"
                          justifyContent="center"
                          width="81%"
                          pl="6"
                        >
                          <Text fontSize="sm" textAlign="center">
                            {value}
                          </Text>
                        </HStack>
                      </Radio>
                      <Box h="6" w="6" />
                    </HStack>
                  </Actionsheet.Item>
                ))}
                {showCustomQuantityInput && (
                  <Actionsheet.Item w="100%" p="6">
                    <HStack>
                      <Input
                        placeholder="数量を入力"
                        keyboardType="numeric"
                        defaultValue="0"
                        value={String(customQuantity)}
                        onChangeText={handleCustomQuantityChange}
                        autoFocus
                        w="100%"
                        variant="outline"
                      />
                    </HStack>
                  </Actionsheet.Item>
                )}
                {error && (
                  <Actionsheet.Item w="100%" px="6">
                    <HStack>
                      <Text color="red.500">{error}</Text>
                    </HStack>
                  </Actionsheet.Item>
                )}
                <Actionsheet.Item w="100%" px="6">
                  <HStack>
                    <Button
                      p="4"
                      bg="darkBlue.900"
                      borderRadius="4"
                      onPress={onCart}
                      w="100%"
                      isDisabled={!!error || isAddingToCart}
                    >
                      {isAddingToCart ? (
                        <Spinner size="sm" color="text.50" />
                      ) : (
                        <Text
                          color="text.50"
                          fontSize="md"
                          fontWeight="bold"
                          w="100%"
                        >
                          {isRequest ? 'リクエストを' : ''}カートに入れる
                        </Text>
                      )}
                    </Button>
                  </HStack>
                </Actionsheet.Item>
              </Radio.Group>
            </ScrollView>
          </KeyboardAvoidingView>
        </Actionsheet.Content>
      </Actionsheet>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          scrollToRelatedProducts()
        }}
        size="lg"
      >
        <Modal.Content maxWidth="400px">
          <Modal.Header>
            <HStack justifyContent="center">
              <VStack space="4">
                <HStack justifyContent="center">
                  <Icon
                    as={
                      <IconCircleCheckFilled
                        size="24"
                        color="white"
                        strokeWidth={1}
                      />
                    }
                    color="darkBlue.700"
                  />
                </HStack>
                <Text fontSize="md" fontWeight="bold" color="text.900">
                  カートに{isRequest && 'リクエスト'}商品を追加しました。
                </Text>
              </VStack>
            </HStack>
          </Modal.Header>
          <Modal.Footer>
            <Button.Group space={4} px="5">
              <Button
                width="50%"
                variant="outline"
                color="muted.300"
                borderRadius="4"
                size="md"
                onPress={() => {
                  setShowModal(false)
                  scrollToRelatedProducts()
                }}
              >
                <Text fontSize="sm" fontWeight="bold" color="text.900">
                  閉じる
                </Text>
              </Button>
              <Button
                width="50%"
                variant="solid"
                color="darkBlue.900"
                borderRadius="4"
                size="md"
                onPress={() => {
                  setShowModal(false)
                  router.replace('/cart/')
                }}
              >
                <Text fontSize="sm" fontWeight="bold" color="text.50">
                  カートを見る
                </Text>
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}
