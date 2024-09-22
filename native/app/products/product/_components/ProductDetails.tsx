import { Text, VStack, Icon, HStack, Badge } from 'native-base'
import {
  IconStar,
  IconStarFilled,
  IconMapPin
} from '@tabler/icons-react-native'
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

type Props = {
  product: Product & {
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
    variants: ProductVariant[]
  }
}

export default function ProductDetails({ product }: Props) {
  const cheapestVariant = product.variants?.reduce((cheapest, variant) => {
    const currentPrice = variant.discountedPrice || variant.price
    const cheapestPrice = cheapest.discountedPrice || cheapest.price
    return currentPrice < cheapestPrice ? variant : cheapest
  }, product.variants[0])
  const cheapestPrice =
    cheapestVariant?.discountedPrice || cheapestVariant?.price

  // ランク
  const rankToNumber = [
    { rank: 'ONE', number: 1 },
    { rank: 'TWO', number: 2 },
    { rank: 'THREE', number: 3 },
    { rank: 'FOUR', number: 4 },
    { rank: 'FIVE', number: 5 }
  ]

  const filledRanks =
    rankToNumber.find((item) => item.rank === product.rank)?.number || 0
  const emptyRanks = 5 - filledRanks
  return (
    <VStack p="4" space="3">
      <Text fontSize="md" fontWeight="bold" color="black">
        {product.name}
      </Text>
      <HStack space={2} alignItems="center" justifyContent="space-between">
        <HStack alignItems="center">
          {Array.from({ length: filledRanks }).map((_, i) => (
            <Icon
              as={<IconStarFilled size="16" />}
              color="orange.400"
              key={rankToNumber[i].rank}
            />
          ))}
          {Array.from({ length: emptyRanks }).map((_, i) => (
            <Icon
              as={<IconStar size="16" />}
              color="orange.400"
              key={rankToNumber[i].rank}
            />
          ))}
        </HStack>
        <HStack alignItems="center">
          <Icon as={<IconMapPin size="16" />} color="trueGray.500" />
          <Text fontSize="xs" color="trueGray.500">
            {product.origin}
          </Text>
        </HStack>
      </HStack>
      <HStack space={1} size="sm" alignItems="center">
        <HStack alignItems="center">
          <Text fontSize="md" color="text.800" fontWeight="bold">
            ¥
          </Text>
          <Text fontSize="md" color="text.800" fontWeight="bold">
            {cheapestPrice?.toLocaleString()}~
          </Text>
        </HStack>
        <Text fontSize="2xs" color="text.800">
          /{product.unit}
        </Text>
      </HStack>
      <HStack space="1">
        {product.tags?.map((tag) => (
          <Badge
            variant="solid"
            rounded="full"
            px="1.5"
            py="1"
            bg="darkBlue.900"
            key={tag.id}
          >
            <Text fontSize="xs" fontWeight="bold" color="text.50">
              {tag.tag.name}
            </Text>
          </Badge>
        ))}
      </HStack>
    </VStack>
  )
}
