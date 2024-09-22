import {
  Box,
  Image,
  Modal,
  Group,
  Switch,
  Menu,
  ActionIcon,
  Flex,
  Badge,
  Title,
  Rating,
  Text,
  useMantineTheme,
  Stack,
  Card
} from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import { IconDots, IconMapPin } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import '@mantine/carousel/styles.css'
import type { AllProductsType } from '~/@types/product'
import {
  DATE_FORMAT_OPTIONS,
  HOW_TO_SELL,
  PRODUCT_BADGES,
  RANK_MAPPING
} from '@/const/config'
import { checkBadgeCondition } from '~/util'
import { modals } from '@mantine/modals'

export default function ProductDetail({
  product,
  onEditFormOpen,
  opened,
  onClose,
  handleDeleteProduct,
  handleDuplicateProduct,
  handleProductPublicationStatus
}: {
  product: AllProductsType | null
  onEditFormOpen: (data: AllProductsType) => void
  opened: boolean
  onClose: () => void
  handleDeleteProduct: (product: AllProductsType | null) => Promise<void>
  handleDuplicateProduct: (productId: number) => Promise<void>
  handleProductPublicationStatus: (
    productId: number,
    isPublished: boolean
  ) => Promise<void>
}) {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [currentProduct, setCurrentProduct] = useState<AllProductsType | null>(
    null
  )
  const theme = useMantineTheme()

  useEffect(() => {
    if (product) {
      setCurrentProduct(product)
    }
  }, [product])

  const handleMenuClose = () => {
    setIsActive(false)
  }

  const toggleVariant = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsActive(!isActive)
  }

  if (!currentProduct) return null

  // 1本、半身、1/4 or 1本、半身、1/4背、1/4腹の順番で表示
  const sortedVariants = currentProduct.variants.sort((a, b) => {
    const order = ['WHOLE', 'HALF_BODY', 'QUATER_BACK', 'QUATER_BELLY']
    return order.indexOf(a.unitType) - order.indexOf(b.unitType)
  })
  const { separateBackBelly } = currentProduct

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="760"
        title="商品詳細"
        centered
        overlayProps={{
          backgroundOpacity: 0.1
        }}
        styles={{
          body: {
            padding: '24px'
          }
        }}
      >
        <Group justify="flex-end" mb={10}>
          <Switch
            checked={currentProduct.isPublished}
            label="公開"
            size="sm"
            styles={{
              label: {
                paddingLeft: '7px'
              }
            }}
            onChange={() => {
              if (currentProduct.isPublished) {
                modals.openConfirmModal({
                  title: '確認',
                  centered: true,
                  children: (
                    <Text size="sm">
                      この商品を公開停止してもよろしいですか？
                    </Text>
                  ),
                  labels: { confirm: 'はい', cancel: 'いいえ' },
                  onCancel: () => modals.closeAll(),
                  onConfirm: async () => {
                    await handleProductPublicationStatus(
                      currentProduct.id,
                      currentProduct.isPublished
                    )
                    setCurrentProduct({
                      ...currentProduct,
                      isPublished: false,
                      publishedEndAt: new Date()
                    })
                  }
                })
              } else {
                modals.openConfirmModal({
                  title: '確認',
                  centered: true,
                  children: (
                    <Text size="sm">この商品を公開してもよろしいですか？</Text>
                  ),
                  labels: { confirm: 'はい', cancel: 'いいえ' },
                  onCancel: () => modals.closeAll(),
                  onConfirm: async () => {
                    await handleProductPublicationStatus(
                      currentProduct.id,
                      currentProduct.isPublished
                    )
                    setCurrentProduct({
                      ...currentProduct,
                      isPublished: true,
                      publishedAt: new Date(),
                      publishedEndAt: null
                    })
                  }
                })
              }
            }}
          />
          <Menu
            withArrow
            position="bottom-start"
            shadow="md"
            onClose={handleMenuClose}
          >
            <Menu.Target>
              <ActionIcon
                variant={isActive ? 'blue.6' : 'transparent'}
                onClick={toggleVariant}
              >
                <IconDots
                  size={23}
                  stroke={2}
                  color={isActive ? '#fff' : '#354052'}
                />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>操作を選択してください</Menu.Label>
              <Menu.Item
                onClick={() => handleDuplicateProduct(currentProduct.id)}
              >
                複製
              </Menu.Item>
              <Menu.Item onClick={() => onEditFormOpen(currentProduct)}>
                編集
              </Menu.Item>
              <Menu.Item
                color={'red.6'}
                disabled={currentProduct.isPublished}
                onClick={() => handleDeleteProduct(product)}
              >
                消去
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Flex gap="lg" wrap="wrap">
          <Box w={250}>
            <Group gap={5} mb={8}>
              {PRODUCT_BADGES.filter(({ label }) =>
                checkBadgeCondition(label, currentProduct)
              ).map(({ label, color }) => (
                <Badge key={label} color={color} fz={10}>
                  {label}
                </Badge>
              ))}
            </Group>
            <Box
              bg="gray.3"
              style={{ borderRadius: '4px' }}
              pb="30"
              pt="30"
              mb="12"
            >
              <Carousel
                withIndicators
                withControls={false}
                styles={{
                  indicators: {
                    bottom: -17
                  },
                  indicator: {
                    width: 5,
                    height: 5,
                    transition: 'width 250ms ease',
                    backgroundColor: '#141517'
                  }
                }}
              >
                {currentProduct.images.map((image) => (
                  <Carousel.Slide key={image.id}>
                    <Image h={188} src={image.url} />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Box>
          </Box>
          <Box style={{ flex: 1 }}>
            <Flex gap={10} mb={8}>
              <Title order={2} fz={16} c="gray.8" fw={700}>
                {currentProduct.name}
              </Title>
              <Badge
                color={currentProduct.isPublished ? 'blue.6' : 'red.6'}
                fz={10}
                style={{ flexShrink: '0' }}
              >
                {currentProduct.isPublished ? '公開中' : '公開停止'}
              </Badge>
            </Flex>
            <Flex justify="space-between" align="center" wrap="wrap">
              <Rating
                value={RANK_MAPPING[currentProduct.rank]}
                size="xs"
                readOnly
              />
              <Group gap={1}>
                <IconMapPin size={12} color={theme.colors.gray[6]} />
                <Text c="gray.6" size="xs">
                  {currentProduct.origin}
                </Text>
              </Group>
            </Flex>
            <Text c="gray.6" size="xs" mt={10}>
              {new Date(currentProduct.updatedAt).toLocaleString(
                'ja-JP',
                DATE_FORMAT_OPTIONS
              )}{' '}
              最終更新 /
              {new Date(currentProduct.createdAt).toLocaleString(
                'ja-JP',
                DATE_FORMAT_OPTIONS
              )}{' '}
              作成 /
              {currentProduct.isPublished && currentProduct.publishedAt
                ? `${new Date(currentProduct.publishedAt).toLocaleString(
                    'ja-JP',
                    DATE_FORMAT_OPTIONS
                  )} 公開`
                : currentProduct.publishedEndAt
                  ? `${new Date(currentProduct.publishedEndAt).toLocaleString(
                      'ja-JP',
                      DATE_FORMAT_OPTIONS
                    )} 公開停止`
                  : ''}
            </Text>
            <Text size="sm" my={8}>
              ◉ {currentProduct.description}
            </Text>
            <Stack align="stretch" gap="sm">
              {sortedVariants.map((variant) => (
                <Card key={variant.id} padding="sm" radius="sm" withBorder>
                  <Group>
                    {variant.discountedPrice !== variant.price &&
                      variant.discountedPrice && (
                        <Badge color="red.7" fz={12} radius="xs">
                          {Math.round(
                            ((variant.price - variant.discountedPrice) /
                              variant.price) *
                              100
                          )}
                          % OFF
                        </Badge>
                      )}
                    {variant.discountedPrice !== variant.price &&
                      variant.discountedPrice !== 0 && (
                        <Text c="dark.3" td="line-through" size="sm">
                          ¥{variant.price.toLocaleString()}
                        </Text>
                      )}
                  </Group>
                  <Group justify="space-between">
                    <Group gap={5} my={6}>
                      {currentProduct.pricingType === '魚' ? (
                        <Text fz="xs" c="gray.8" fw={700}>
                          {variant.unitType === 'QUATER_BACK' &&
                          !separateBackBelly
                            ? '1/4'
                            : HOW_TO_SELL[variant.unitType]}
                        </Text>
                      ) : (
                        <Text fz="xs" c="gray.8" fw={700}>
                          {variant.salesFormat}
                        </Text>
                      )}
                      <Text fz="md" fw={700} c="gray.8">
                        ¥
                        {(
                          variant.discountedPrice || variant.price
                        ).toLocaleString()}
                      </Text>
                      <Text fz={10} c="gray.8">
                        /{currentProduct.unit}
                      </Text>
                    </Group>
                    <Badge color="gray.7" fz={12} radius="xs">
                      在庫{variant.quantity}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Box>
        </Flex>
      </Modal>
    </>
  )
}
