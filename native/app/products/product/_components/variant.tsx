import { Text, VStack, Pressable, HStack, Badge, Radio } from 'native-base'
import type { Product, ProductUnitType, ProductVariant } from '@prisma/client'
import type React from 'react'

const UNIT_TYPE_TO_STRING = {
  WHOLE: '1本',
  HALF_BODY: '半身',
  QUATER_BELLY: '1/4腹',
  QUATER_BACK: '1/4背'
} as const
export const convertUnitTypeToString = ({
  unitType,
  separateBackBelly
}: { unitType: ProductUnitType; separateBackBelly: boolean }) => {
  const unitTypeName = UNIT_TYPE_TO_STRING[unitType]
  const displayedUnitTypeName = separateBackBelly
    ? unitTypeName
    : unitTypeName.replace('背', '')
  return displayedUnitTypeName
}

export default function Variant({
  product,
  variant,
  separateBackBelly,
  selected,
  index
}: {
  product: Product
  variant: ProductVariant
  separateBackBelly: boolean
  selected: number
  setSelected: React.Dispatch<React.SetStateAction<number>>
  index: number
}) {
  const displayedUnitTypeName = convertUnitTypeToString({
    unitType: variant.unitType,
    separateBackBelly
  })
  return (
    <Pressable
      key={variant.id}
      bg={selected === index ? 'primary.100' : 'white'}
      px="3.5"
      py="4"
      rounded="4"
      borderColor="coolGray.400"
      borderWidth="1"
    >
      <Radio value={String(index)}>
        <VStack space="2" w="90%">
          {variant.discountedPrice !== variant.price &&
            variant.discountedPrice !== 0 &&
            variant.discountedPrice && (
              <HStack space="2">
                <Badge
                  variant="solid"
                  rounded="2"
                  px="1"
                  py="0.5"
                  bg="error.600"
                >
                  <Text fontSize="xs" fontWeight="bold" color="text.50">
                    {Math.round(
                      ((variant.price - variant.discountedPrice) /
                        variant.price) *
                        100
                    )}
                    % OFF
                  </Text>
                </Badge>
                <Text
                  fontSize="sm"
                  color="warmGray.500"
                  textDecorationLine="line-through"
                >
                  ¥{variant.price.toLocaleString()}
                </Text>
              </HStack>
            )}

          <HStack alignItems="center" justifyContent="space-between">
            <HStack space={1} alignItems="center">
              <Text fontSize="sm" color="black" fontWeight="bold">
                {product.pricingType === '魚'
                  ? displayedUnitTypeName
                  : variant.salesFormat}
              </Text>
              <HStack alignItems="center">
                <Text fontSize="xl" color="error.500" fontWeight="bold">
                  ¥
                </Text>
                <Text fontSize="xl" color="error.500" fontWeight="bold">
                  {variant.discountedPrice !== null &&
                  variant.discountedPrice !== 0
                    ? variant.discountedPrice.toLocaleString()
                    : variant.price.toLocaleString()}
                </Text>
              </HStack>
              <Text fontSize="sm" color="black" fontWeight="bold">
                {product.unit}
              </Text>
            </HStack>
            <Badge variant="solid" rounded="2" px="1" py="0.5" bg="muted.600">
              <Text fontSize="xs" fontWeight="bold" color="text.50">
                {variant.quantity === 0
                  ? 'リクエスト可'
                  : `在庫${variant.quantity}`}
              </Text>
            </Badge>
          </HStack>
          {variant.quantity === 0 && (
            <Text fontSize="xs" color="trueGray.500">
              リクエストいただいた場合は入荷次第ご連絡差し上げます。
            </Text>
          )}
        </VStack>
      </Radio>
    </Pressable>
  )
}
