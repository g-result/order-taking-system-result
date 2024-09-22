import { Box, Text, Image, VStack, HStack, Badge } from 'native-base'
import SwiperFlatList from 'react-native-swiper-flatlist'
import type { ProductImage, ProductCategory, Category } from '@prisma/client'
import { Dimensions } from 'react-native'
import { categoryIconMap } from '@/const/CategoryIcons'
import { IconUrlMap } from '../..'

type Props = {
  categories: (ProductCategory & {
    category: Category
  })[]
  images: ProductImage[]
  activeIndex: number
  setActiveIndex: (index: number) => void
}

export default function ProductImages({
  categories,
  images,
  activeIndex,
  setActiveIndex
}: Props) {
  const { width } = Dimensions.get('window')

  const CategoryIconComponent = ({ name }: { name: string }) => {
    const Component = categoryIconMap[name]
    return <Component color="white" />
  }

  const renderItem = ({ item }: { item: ProductImage }) => (
    <Box>
      <Image
        source={{ uri: item.url }}
        alt="test"
        width={width}
        height={width}
        resizeMode="contain"
      />
    </Box>
  )

  return (
    <Box position="relative" bg="coolGray.100">
      <SwiperFlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onChangeIndex={({ index }) => setActiveIndex(index)}
      />
      <Box
        position="absolute"
        bottom="4"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <HStack mt={2} justifyContent="center" space="2">
          {images.map((image, index) => (
            <Box
              key={image.id}
              bg={index === activeIndex ? 'trueGray.900' : 'trueGray.400'}
              width="5px"
              height="5px"
              borderRadius="full"
            />
          ))}
        </HStack>
      </Box>
      <VStack position="absolute" bottom="10px" right="10px" space="2">
        {categories?.map((category) => (
          <Badge
            variant="solid"
            rounded="full"
            px="1.5"
            py="1"
            key={category.id}
            bg={category.category.color}
          >
            <HStack space="1" alignItems="center">
              {category.category.iconUrl === 'crab' ||
              category.category.iconUrl === 'shell' ? (
                <Image
                  source={IconUrlMap[category.category.iconUrl]}
                  alt="alternate Text"
                  width={5}
                  height={5}
                />
              ) : (
                category.category.iconUrl && (
                  <CategoryIconComponent name={category.category.iconUrl} />
                )
              )}
              <Text fontSize="xs" fontWeight="bold" color="text.50">
                {category.category.name}
              </Text>
            </HStack>
          </Badge>
        ))}
      </VStack>
    </Box>
  )
}
