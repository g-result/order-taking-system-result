import { Box, Text, VStack, SimpleGrid } from 'native-base'
import FlowSection from './FlowSection'
import ProductCard from '@/components/ProductCard'
import dayjs from 'dayjs'
import { nativeApi } from '@/lib/trpc'

export default function OrderComplete() {
  const { data: products } = nativeApi.product.list.useQuery()
  const transferedProducts = products?.map((product) => ({
    ...product,
    createdAt: dayjs(product.createdAt).toDate(),
    updatedAt: dayjs(product.updatedAt).toDate(),
    categories: product.categories.map((category) => ({
      ...category,
      createdAt: dayjs(category.createdAt).toDate(),
      updatedAt: dayjs(category.updatedAt).toDate(),
      category: {
        ...category.category,
        createdAt: dayjs(category.category.createdAt).toDate(),
        updatedAt: dayjs(category.category.updatedAt).toDate()
      }
    })),
    tags: product.tags.map((tag) => ({
      ...tag,
      createdAt: dayjs(tag.createdAt).toDate(),
      updatedAt: dayjs(tag.updatedAt).toDate(),
      tag: {
        ...tag.tag,
        createdAt: dayjs(tag.tag.createdAt).toDate(),
        updatedAt: dayjs(tag.tag.updatedAt).toDate()
      }
    })),
    recommendTags: product.recommendTags.map((recommendTag) => ({
      ...recommendTag,
      createdAt: dayjs(recommendTag.createdAt).toDate(),
      updatedAt: dayjs(recommendTag.updatedAt).toDate(),
      recommendTag: {
        ...recommendTag.recommendTag,
        createdAt: dayjs(recommendTag.recommendTag.createdAt).toDate(),
        updatedAt: dayjs(recommendTag.recommendTag.updatedAt).toDate()
      }
    })),
    images: product.images.map((image) => ({
      ...image,
      createdAt: dayjs(image.createdAt).toDate(),
      updatedAt: dayjs(image.updatedAt).toDate()
    })),
    variants: product.variants.map((variant) => ({
      ...variant,
      createdAt: dayjs(variant.createdAt).toDate(),
      updatedAt: dayjs(variant.updatedAt).toDate()
    }))
  }))
  return (
    <>
      <VStack py="3" space="3">
        <FlowSection status={'ORDER_COMPLETE'} />
        {/* 注文商品 */}
        <VStack py="6" px="4" bg="white" space="4">
          <Text
            color="text.900"
            fontWeight="bold"
            fontSize="lg"
            textAlign="center"
          >
            ご注文いただきありがとうございました
          </Text>
          <Text color="text.900" fontSize="sm">
            商品の発送まで今しばらくお待ちくださいませ。キャンセルする場合は直接運営者までお問い合わせください。
          </Text>
        </VStack>
        <VStack px="4" py="6" space="4" bg="white">
          <Text
            color="text.900"
            fontWeight="bold"
            fontSize="lg"
            textAlign="center"
          >
            その他おすすめ商品
          </Text>
          <Box>
            <SimpleGrid columns={2} space={4}>
              {transferedProducts?.map((product) => {
                return <ProductCard product={product} key={product.id} />
              })}
            </SimpleGrid>
          </Box>
        </VStack>
      </VStack>
    </>
  )
}
