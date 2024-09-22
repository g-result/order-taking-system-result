import { useState, useEffect } from 'react'
import {
  IconStar,
  IconStarFilled,
  IconMapPin
} from '@tabler/icons-react-native'
import {
  Box,
  Text,
  Icon,
  HStack,
  Image,
  VStack,
  Badge,
  Pressable
} from 'native-base'
import { Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import type {
  Product,
  Category,
  Tag,
  RecommendTag,
  ProductImage,
  ProductVariant,
  ProductCategory,
  ProductTag,
  ProductRecommendTag
} from '@prisma/client'
import { supabase } from '@/lib/supabase'

// ランク
const RANK_TO_NUMBER = [
  { rank: 'ONE', number: 1 },
  { rank: 'TWO', number: 2 },
  { rank: 'THREE', number: 3 },
  { rank: 'FOUR', number: 4 },
  { rank: 'FIVE', number: 5 }
] as const

type AllProductsType = Product & {
  categories: (ProductCategory & {
    category: Category
  })[]
  tags: (ProductTag & {
    tag: Tag
  })[]
  recommendTags: (ProductRecommendTag & {
    recommendTag: RecommendTag
  })[]
  images: ProductImage[]
  variants?: ProductVariant[]
}

export default function ProductCard({ product }: { product: AllProductsType }) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const router = useRouter()
  const { width } = Dimensions.get('window')
  const cardWidth = width * 0.438

  useEffect(() => {
    const fetchImageUrl = () => {
      if (product.images[0]?.url) {
        const imageUrl = product.images[0].url
        setImageUrl(imageUrl)
      }
    }
    fetchImageUrl()
  }, [product.images])

  // セールのタグ
  const isSale = product.variants?.some(
    (variant) =>
      variant.discountedPrice !== null &&
      variant.discountedPrice !== 0 &&
      variant.discountedPrice < variant.price
  )

  // 新入荷のタグ
  const targetTime = new Date(product.updatedAt)
  const now = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  const diff = now.getTime() - targetTime.getTime()
  const isNewProduct = !!(diff >= 0 && diff <= oneDay)

  const filledRanks =
    RANK_TO_NUMBER.find((item) => item.rank === product.rank)?.number || 0 // 埋まった星の数
  const emptyRanks = 5 - filledRanks // 空の星の数

  // 金額
  let displayPrice: number | undefined = undefined
  if (product.pricingType === '魚') {
    // 魚の場合、1本の価格を表示
    const wholeVariant = product.variants?.find(
      (variant) => variant.unitType === 'WHOLE'
    )
    displayPrice = wholeVariant?.discountedPrice || wholeVariant?.price
  } else {
    // 魚以外の場合、最初に登録されている商品の金額を表示
    const firstVariant = product.variants?.[0]
    displayPrice = firstVariant?.discountedPrice || firstVariant?.price
  }

  return (
    <Pressable
      onPress={() => router.replace(`/products/product/${product.id}`)}
    >
      <Box key={product.id} flex={1} width={cardWidth}>
        <Box
          position="relative"
          height="175"
          width="100%"
          bg="coolGray.100"
          borderRadius="4"
        >
          {isSale && (
            <Badge
              position="absolute"
              top="0"
              left="0"
              zIndex="1"
              variant="solid"
              borderRadius="2"
              bgColor="error.500"
              py="1"
              px="1.5"
              m="2"
            >
              <Text fontSize="xs" fontWeight="bold" color="text.50">
                セール
              </Text>
            </Badge>
          )}
          <HStack
            position="absolute"
            bottom="0"
            right="0"
            m="1"
            space="1"
            zIndex="1"
          >
            {product.isRecommended && (
              <Badge bgColor="tertiary.500" borderRadius="16" px="1" py="0.5">
                <Text fontSize="xs" fontWeight="bold" color="text.50">
                  おすすめ
                </Text>
              </Badge>
            )}
            {isNewProduct && (
              <Badge bgColor="warning.500" borderRadius="16" px="1" py="0.5">
                <Text fontSize="xs" fontWeight="bold" color="text.50">
                  新入荷
                </Text>
              </Badge>
            )}
          </HStack>
          <Image
            source={{ uri: imageUrl }}
            alt={`${product.name}の画像`}
            height="175"
            width="100%"
            borderRadius="4"
            bgColor="coolGray.100"
          />
        </Box>
        <VStack space={2}>
          <Text fontSize="sm" color="text.900" fontWeight="bold">
            {product.name}
          </Text>
          <HStack space={1} size="sm" alignItems="center">
            <HStack alignItems="center">
              <Text
                fontSize="md"
                color={!isSale ? 'text.800' : 'error.600'}
                fontWeight="bold"
              >
                ¥
              </Text>
              <Text
                fontSize="md"
                color={!isSale ? 'text.800' : 'error.600'}
                fontWeight="bold"
              >
                {displayPrice?.toLocaleString()}~
              </Text>
            </HStack>
            <Text fontSize="2xs" color="text.800">
              /{product.unit}
            </Text>
          </HStack>
          <HStack space={2} alignItems="center" justifyContent="space-between">
            <HStack alignItems="center">
              {Array.from({ length: filledRanks }, (_, i) => (
                <Icon
                  as={<IconStarFilled size="16" />}
                  color="orange.400"
                  key={RANK_TO_NUMBER[i].rank}
                />
              ))}
              {Array.from({ length: emptyRanks }, (_, i) => (
                <Icon
                  as={<IconStar size="16" />}
                  color="orange.400"
                  key={RANK_TO_NUMBER[i].rank}
                />
              ))}
            </HStack>
            <HStack alignItems="center">
              <Icon as={<IconMapPin size="16" />} color="trueGray.500" />
              <Text
                fontSize="xs"
                color="trueGray.500"
              >{`${product.origin}産`}</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  )
}
