import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Text,
  Input,
  Icon,
  StatusBar,
  Button,
  ScrollView,
  HStack,
  SimpleGrid,
  Actionsheet,
  useDisclose,
  Spinner,
  Image
} from 'native-base'
import type {
  NativeSyntheticEvent,
  TextInputChangeEventData
} from 'react-native'
import { nativeApi } from '@/lib/trpc'
import BottomNavigation from '@/components/BottomNavigation'
import ProductCard from '@/components/ProductCard'
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
import {
  IconSearch,
  IconAdjustments,
  IconCheck
} from '@tabler/icons-react-native'
import { categoryIconMap } from '@/const/CategoryIcons'
import { requestPermissionsAsync } from '@/lib/expo'
import { News } from './_conponents/News'
import { NotReadyGlassOverlay } from '@/components/NotReadyGlassOverlay'
import { getIsReady } from '@/hooks/isReady'
import { usePushNotification } from '@/hooks/pushNotification'

export const IconUrlMap = {
  crab: require('../../assets/icons/crab.png'),
  shell: require('../../assets/icons/shell.png')
}

type productWithVariant = Product & {
  variants: ProductVariant[]
}

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
  variants: ProductVariant[]
}
const DEFAULT_CATEGORIES = [
  {
    id: 'all',
    name: 'すべて',
    iconUrl: null,
    color: 'info.500',
    type: 'all'
  },
  {
    id: 'recommend',
    name: 'おすすめ',
    iconUrl: null,
    color: 'tertiary.500',
    type: 'recommend'
  },
  {
    id: 'new',
    name: '新入荷',
    iconUrl: null,
    color: 'warning.500',
    type: 'new'
  }
]
const SORT_COLUMN = [
  { id: 1, name: 'おすすめ順' },
  { id: 2, name: '新しい順' },
  { id: 3, name: '価格の安い順' },
  { id: 4, name: '価格の高い順' },
  { id: 5, name: '星が多い順' }
]
export default function HomeScreen() {
  usePushNotification() // 通知登録と許可の確認
  const {
    data: products,
    error: productsError,
    isLoading: isLoadingProducts
  } = nativeApi.product.list.useQuery()
  const {
    data: categories,
    error: categoriesError,
    isLoading: isLoadingCategories
  } = nativeApi.category.getAll.useQuery()

  const isLoading = isLoadingProducts || isLoadingCategories

  useEffect(() => {
    requestPermissionsAsync()
  }, [])

  useEffect(() => {
    if (productsError) console.error('Failed to fetch products', productsError)
    if (categoriesError) console.error('Failed to fetch categories:')
  }, [productsError, categoriesError])

  const allCategories = [...DEFAULT_CATEGORIES, ...(categories ?? [])]
  const [activeCategory, setActiveCategory] = useState<number | string>('all')
  const [checkedSort, setCheckedSort] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const { isOpen, onOpen, onClose } = useDisclose()

  const getLowestPrice = (product: productWithVariant) => {
    return Math.min(
      ...product.variants.map(
        (variant) => variant.discountedPrice ?? variant.price
      )
    )
  }

  const filteredProducts = useMemo<AllProductsType[] | never[]>(() => {
    if (!products) return []

    // カテゴリフィルタリング
    const setCategory = allCategories.find(
      (category) => category.id === activeCategory
    )
    let filteredProducts = products
    if (setCategory) {
      if (setCategory.id === 'recommend') {
        filteredProducts = products.filter((product) => product.isRecommended)
      } else if (setCategory.id === 'new') {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        filteredProducts = products.filter((product) => {
          const updatedAt = new Date(product.updatedAt)
          return updatedAt > oneDayAgo && updatedAt <= now
        })
      } else if (typeof setCategory.id === 'number') {
        filteredProducts = products.filter((product) =>
          product.categories.some(
            (category) => category.categoryId === setCategory.id
          )
        )
      }
    }

    // 検索フィルタリング
    filteredProducts = filteredProducts.filter((product) => {
      if (product.name.includes(searchInput)) {
        return true
      }
      return product.tags.some((tag) => tag.tag.name.includes(searchInput))
    })

    // ソート
    if (checkedSort === 1) {
      filteredProducts.sort(
        (a, b) => Number(b.isRecommended) - Number(a.isRecommended)
      )
    } else if (checkedSort === 2) {
      filteredProducts.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } else if (checkedSort === 3) {
      filteredProducts.sort((a, b) => getLowestPrice(a) - getLowestPrice(b))
    } else if (checkedSort === 4) {
      filteredProducts.sort((a, b) => getLowestPrice(b) - getLowestPrice(a))
    } else if (checkedSort === 5) {
      const rankOrder = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']
      filteredProducts.sort(
        (a, b) => rankOrder.indexOf(b.rank) - rankOrder.indexOf(a.rank)
      )
    }

    return filteredProducts
  }, [products, activeCategory, checkedSort, searchInput])

  const changeSearchInput = (
    e: NativeSyntheticEvent<TextInputChangeEventData>
  ) => {
    setSearchInput(e.nativeEvent.text)
  }

  const CategoryIconComponent = ({ name }: { name: string }) => {
    const Component = categoryIconMap[name]
    return <Component color="white" />
  }

  const { data: globalSettings } = nativeApi.globalSettings.findFirst.useQuery()

  // 市場が開いているかどうか。
  const isReady = useMemo(() => {
    return getIsReady(globalSettings?.overrideUsageRestriction ?? true)
  }, [globalSettings])

  if (isLoading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="lg" />
      </Box>
    )
  }
  return (
    <>
      <ScrollView scrollEnabled={isReady}>
        <Box safeAreaTop>
          <StatusBar />
        </Box>
        {/* お知らせ */}
        <News />
        {!isReady && <NotReadyGlassOverlay />}

        {/* カテゴリー */}
        <Box pb="4">
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {allCategories?.map((category) => (
              <Button
                key={category.id}
                mx="1"
                borderRadius="full"
                bg={category.color}
                {...(activeCategory !== category.id && { opacity: 0.5 })}
                onPress={() => setActiveCategory(category.id)}
              >
                <HStack space="1" alignItems="center">
                  {category.iconUrl === 'crab' ||
                  category.iconUrl === 'shell' ? (
                    <Image
                      source={IconUrlMap[category.iconUrl]}
                      alt="alternate Text"
                      width={5}
                      height={5}
                    />
                  ) : (
                    category.iconUrl && (
                      <CategoryIconComponent name={category.iconUrl} />
                    )
                  )}
                  <Text color="text.50" fontSize="sm" fontWeight="bold">
                    {category.name}
                  </Text>
                </HStack>
              </Button>
            ))}
          </ScrollView>
        </Box>
        {/* キーワード・タグ検索 */}
        <Box px="4">
          <Input
            placeholder="キーワード・タグで検索"
            variant="filled"
            size="md"
            borderRadius="sm"
            placeholderTextColor="text.400"
            px="3"
            py="2"
            InputLeftElement={
              <Icon
                as={<IconSearch size="20" />}
                size="sm"
                color="muted.500"
                ml="2"
              />
            }
            onChange={changeSearchInput}
            value={searchInput}
          />
        </Box>

        {/* 商品準備中の場合、ぼかしビューを上乗せ */}
        {isReady && (
          <>
            {/* メイン */}
            <Box px="4">
              {/* ソート */}
              <Box py="1">
                <HStack justifyContent="flex-end" alignItems="center">
                  <Button
                    endIcon={
                      <Icon
                        as={<IconAdjustments size="16" strokeWidth={1} />}
                        color="muted.700"
                      />
                    }
                    size="sm"
                    variant="Unstyled"
                    onPress={onOpen}
                  >
                    <Text color="muted.700">
                      {
                        SORT_COLUMN.find((column) => column.id === checkedSort)
                          ?.name
                      }
                    </Text>
                  </Button>
                </HStack>
              </Box>
              {/* 商品リスト */}
              <Box>
                <SimpleGrid columns={2} space={4}>
                  {filteredProducts?.map((product) => {
                    return <ProductCard product={product} key={product.id} />
                  })}
                </SimpleGrid>
              </Box>
            </Box>
          </>
        )}
      </ScrollView>
      {/* ボトムナビゲーション */}
      <BottomNavigation />
      {/* おすすめ順 */}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Box w="100%" h={60} px={4} justifyContent="center">
            <Text
              fontSize="16"
              color="gray.500"
              _dark={{
                color: 'gray.300'
              }}
            >
              並び替え
            </Text>
          </Box>
          {SORT_COLUMN.map((sortColum) => (
            <Actionsheet.Item
              startIcon={
                <Icon
                  as={<IconCheck size="16" />}
                  color="muted.500"
                  {...(checkedSort !== sortColum.id && { opacity: 0 })}
                />
              }
              key={sortColum.id}
              onPress={() => {
                setCheckedSort(sortColum.id)
                onClose()
              }}
            >
              {sortColum.name}
            </Actionsheet.Item>
          ))}
        </Actionsheet.Content>
      </Actionsheet>
    </>
  )
}
