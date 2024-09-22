import {
  Button,
  Checkbox,
  useMantineTheme,
  Box,
  Group,
  Text,
  Grid,
  Card,
  Flex,
  Image,
  Title,
  Badge,
  NumberInput,
  Switch,
  Menu,
  ActionIcon,
  Rating,
  TextInput,
  Pagination
} from '@mantine/core'
import {
  IconAdjustments,
  IconCheck,
  IconChevronDown,
  IconDots,
  IconMapPin,
  IconPlus,
  IconSearch
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import Notification from './Notification'
import { useDisclosure } from '@mantine/hooks'
import ProductDetail from './ProductDetail'
import { ProductForm } from './ProductForm/Form'
import { ProductEditForm } from './ProductForm/EditForm'
import { checkBadgeCondition, sleep } from '~/util'
import { clientApi } from '~/lib/trpc/client-api'
import type { AllProductsType } from '~/@types/product'
import {
  DATE_FORMAT_OPTIONS,
  PRODUCT_BADGES,
  RANK_MAPPING,
  SORT_OPTIONS
} from '@/const/config'
import { modals } from '@mantine/modals'
import { useRouter } from 'next/navigation'
import { $Enums } from '@prisma/client'

export const ProductList = ({
  selectedCategory,
  page,
  setPage
}: {
  selectedCategory: string | null
  page: number
  setPage: (page: number) => void
}) => {
  const [products, setProducts] = useState<AllProductsType[]>([])
  const [editProductData, setEditProductData] =
    useState<AllProductsType | null>(null)
  const [selectedProduct, setSelectedProduct] =
    useState<AllProductsType | null>(null)
  const [selectAll, setSelectAll] = useState(false)
  const theme = useMantineTheme()
  const [showNotification, setShowNotification] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('createdAtDesc')
  const [sortLabel, setSortLabel] = useState('作成日時が新しい順')
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [localStockValues, setLocalStockValues] = useState<{
    [key: number]: number
  }>({})
  const pageSize = 100

  const fetchCategoryWithProductsData =
    selectedCategory !== 'all'
      ? clientApi.product.getAllProductsByCategoryIdWithCount.useQuery(
          Number(selectedCategory)
        )
      : clientApi.product.getAllProductsWithCount.useQuery()
  const deleteProductMutation = clientApi.product.delete.useMutation()
  const multiDeleteProductMutation = clientApi.product.multiDelete.useMutation()
  const duplicateProductMutation = clientApi.product.duplicate.useMutation()
  const multiDuplicateProductMutation =
    clientApi.product.multiDuplicate.useMutation()
  const publishProductMutation = clientApi.product.publish.useMutation()
  const unpublishProductMutation = clientApi.product.unpublish.useMutation()
  const updateProductStockMutation = clientApi.product.update.useMutation()

  // 商品並び替え
  const sortProducts = (products: AllProductsType[]) => {
    const sortFunctions: {
      [key: string]: (a: AllProductsType, b: AllProductsType) => number
    } = {
      createdAtAsc: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      stockDesc: (a, b) => b.variants[0].quantity - a.variants[0].quantity,
      stockAsc: (a, b) => a.variants[0].quantity - b.variants[0].quantity,
      ratingDesc: (a, b) => RANK_MAPPING[b.rank] - RANK_MAPPING[a.rank],
      priceDesc: (a, b) => b.variants[0].price - a.variants[0].price,
      priceAsc: (a, b) => a.variants[0].price - b.variants[0].price,
      createdAtDesc: (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      recommended: (a, b) => {
        if (b.isRecommended !== a.isRecommended) {
          return Number(b.isRecommended) - Number(a.isRecommended)
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    }
    return products.sort(sortFunctions[sortOption] || (() => 0))
  }

  useEffect(() => {
    if (
      fetchCategoryWithProductsData.isSuccess &&
      fetchCategoryWithProductsData.data
    ) {
      let records = fetchCategoryWithProductsData.data.products
      // 論理削除された商品を除外
      records = records.filter(
        (product) =>
          !product.deletedAt && !deletedProductIds.includes(product.id)
      )
      records = sortProducts(records)
      setProducts(records)
      setTotal(records.length)
      setTotalPages(Math.ceil(records.length / pageSize))
    } else {
      setProducts([])
    }
  }, [
    fetchCategoryWithProductsData.isSuccess,
    fetchCategoryWithProductsData.data,
    selectedCategory,
    page,
    deletedProductIds
  ])

  // 現在のページに表示する商品を計算
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentProducts = products.slice(startIndex, endIndex)

  // 絞り込み機能
  useEffect(() => {
    if (
      fetchCategoryWithProductsData.isSuccess &&
      fetchCategoryWithProductsData.data
    ) {
      let filteredProducts = fetchCategoryWithProductsData.data.products
      // 論理削除された商品を除外
      filteredProducts = filteredProducts.filter(
        (product) => !deletedProductIds.includes(product.id)
      )
      // キーワード・タグで検索
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.includes(searchQuery) ||
            product.description?.includes(searchQuery) ||
            product.origin.includes(searchQuery) ||
            product.categories.some((category) =>
              category.category.name.includes(searchQuery)
            ) ||
            product.tags.some((tag) => tag.tag.name.includes(searchQuery)) ||
            product.recommendTags.some((recommendTag) =>
              recommendTag.recommendTag.name.includes(searchQuery)
            )
        )
      }
      filteredProducts = sortProducts(filteredProducts)
      setProducts(filteredProducts)
      setTotal(filteredProducts.length)
      setTotalPages(Math.ceil(filteredProducts.length / pageSize))
    } else {
      setProducts([])
    }
  }, [
    fetchCategoryWithProductsData.isSuccess,
    fetchCategoryWithProductsData.data,
    searchQuery,
    deletedProductIds
  ])

  useEffect(() => {
    setProducts((prevProducts) => sortProducts([...prevProducts]))
  }, [sortOption])

  const [
    productDetailModalOpened,
    { open: productDetailModalOpen, close: productDetailModalClose }
  ] = useDisclosure(false)

  const handleProductClick = (product: AllProductsType) => {
    setSelectedProduct(product)
    productDetailModalOpen()
  }

  // 新規登録画面の表示制御
  const [
    productFormOpened,
    { open: productFormModalOpen, close: productFormModalClose }
  ] = useDisclosure(false)
  // 新規登録画面の表示
  const handleProductFormClick = () => {
    productFormModalOpen()
  }

  //  編集画面の表示制御
  const [
    productEditFormOpened,
    { open: productEditFormModalOpen, close: productEditFormModalClose }
  ] = useDisclosure(false)

  // 編集画面の表示
  const handleEditProductFormClick = (data: AllProductsType): void => {
    setEditProductData(data)
    productDetailModalClose()
    productEditFormModalOpen()
  }

  const handleRegisterProduct = () => {
    setShowNotification(true)
    sleep(3000).then(() => {
      setShowNotification(false)
    })
  }

  const handleDeleteProduct = async (productId: number) => {
    const product = products.find((product) => product.id === productId)
    if (product?.isPublished) {
      return
    }
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">商品を消去してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await deleteProductMutation.mutateAsync(productId)
          setProducts((prevProducts) =>
            prevProducts.filter((product) => product.id !== productId)
          )
          setDeletedProductIds((prevIds) => [...prevIds, productId])
          const remainingProducts = total - 1
          const newTotalPages = Math.ceil(remainingProducts / pageSize)
          if (page > newTotalPages) {
            setPage(newTotalPages)
          }
          setTotal(remainingProducts)
          setTotalPages(newTotalPages)
          sleep(500).then(() => productDetailModalClose())
        } catch (error) {
          console.error('商品消去に失敗しました:', error)
        }
      }
    })
  }

  const handleMultiDeleteProducts = () => {
    if (selectedRows.length === 0) return
    const publishedProducts = products.filter(
      (product) => selectedRows.includes(product.id) && product.isPublished
    )
    if (publishedProducts.length > 0) {
      return
    }
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">商品を消去してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await multiDeleteProductMutation.mutateAsync(selectedRows)
          setProducts((prevProducts) =>
            prevProducts.filter((product) => !selectedRows.includes(product.id))
          )
          setDeletedProductIds((prevIds) => [...prevIds, ...selectedRows])
          setSelectedRows([])
          const remainingProducts = total - selectedRows.length
          const newTotalPages = Math.ceil(remainingProducts / pageSize)
          if (page > newTotalPages) {
            setPage(newTotalPages)
          }
          setTotal(remainingProducts)
          setTotalPages(newTotalPages)
        } catch (error) {
          console.error('商品消去に失敗しました:', error)
        }
      }
    })
  }

  const handleDuplicateProduct = async (productId: number) => {
    try {
      const duplicatedProduct =
        await duplicateProductMutation.mutateAsync(productId)
      // 指定された商品の次に複製商品を挿入
      setProducts((prevProducts) => {
        const productIndex = prevProducts.findIndex(
          (product) => product.id === productId
        )
        if (productIndex === -1) return prevProducts
        const newProducts = [...prevProducts]
        newProducts.splice(productIndex + 1, 0, duplicatedProduct)
        return newProducts
      })
      setTotal((prevTotal) => prevTotal + 1)
      setTotalPages(Math.ceil((total + 1) / pageSize))
      sleep(500).then(() => productDetailModalClose())
    } catch (error) {
      console.error('複製に失敗しました:', error)
    }
  }

  const handleMultiDuplicateProducts = async () => {
    if (selectedRows.length === 0) return
    try {
      const duplicatedProducts =
        await multiDuplicateProductMutation.mutateAsync(selectedRows)
      // 指定された商品の次に複製商品を挿入
      setProducts((prevProducts) => {
        const newProducts = [...prevProducts]
        selectedRows.forEach((productId, index) => {
          const productIndex = newProducts.findIndex(
            (product) => product.id === productId
          )
          if (productIndex !== -1) {
            newProducts.splice(productIndex + 1, 0, duplicatedProducts[index])
          }
        })
        return newProducts
      })
      setTotal((prevTotal) => prevTotal + selectedRows.length)
      setTotalPages(Math.ceil((total + selectedRows.length) / pageSize))
      setSelectedRows([])
    } catch (error) {
      console.error('複製に失敗しました:', error)
    }
  }

  const handleProductPublicationStatus = async (
    productId: number,
    isPublished: boolean
  ) => {
    try {
      if (isPublished) {
        await unpublishProductMutation.mutateAsync(productId)
      } else {
        await publishProductMutation.mutateAsync(productId)
      }
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                isPublished: !isPublished,
                publishedAt: !isPublished ? new Date() : product.publishedAt,
                publishedEndAt: isPublished
                  ? new Date()
                  : product.publishedEndAt
              }
            : product
        )
      )
    } catch (error) {
      console.error(
        isPublished ? '公開停止に失敗しました:' : '公開に失敗しました:',
        error
      )
    }
  }

  const handleMultiProductPublicationStatus = (isPublished: boolean) => {
    if (selectedRows.length === 0) return
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: (
        <Text size="sm">
          {isPublished
            ? '商品を公開停止してもよろしいですか？'
            : '商品を公開してもよろしいですか？'}
        </Text>
      ),
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedRows.map((productId) =>
              isPublished
                ? unpublishProductMutation.mutateAsync(productId)
                : publishProductMutation.mutateAsync(productId)
            )
          )
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              selectedRows.includes(product.id)
                ? {
                    ...product,
                    isPublished: !isPublished,
                    publishedAt: !isPublished
                      ? new Date()
                      : product.publishedAt,
                    publishedEndAt: isPublished
                      ? new Date()
                      : product.publishedEndAt
                  }
                : product
            )
          )
        } catch (error) {
          console.error(
            isPublished ? '公開停止に失敗しました:' : '公開に失敗しました:',
            error
          )
        }
      }
    })
  }

  const handleLocalStockChange = (productId: number, value: number) => {
    setLocalStockValues((prev) => ({ ...prev, [productId]: value }))
  }

  const getDefaultStockValue = (product: AllProductsType): number => {
    const displayProduct = product.variants.find(
      (variant) => variant.displayOrder === 1
    )
    return displayProduct?.quantity ?? product.variants[0].quantity ?? 0
  }

  const handleTotalStockChange = async (
    newWholeQuantity: number,
    product: AllProductsType
  ) => {
    modals.openConfirmModal({
      title: '在庫調整の確認',
      centered: true,
      children: <Text size="sm">在庫を変更してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => modals.closeAll(),
      onConfirm: async () => {
        try {
          const data = await updateProductStockMutation.mutateAsync({
            id: product.id,
            data: {
              ...product,
              categories: product.categories.map(
                (category) => category.categoryId
              ),
              tags: product.tags.map((tag) => tag.tagId),
              recommendTags: product.recommendTags.map(
                (recommendTag) => recommendTag.recommendTagId
              ),
              variants: product.variants.map((variant) => ({
                id: variant.id,
                unitType: variant.unitType,
                price: variant.price,
                salesFormat: variant.salesFormat,
                displayOrder: variant.displayOrder ?? undefined,
                quantity:
                  variant.displayOrder === 1 &&
                  variant.unitType === $Enums.ProductUnitType.WHOLE
                    ? newWholeQuantity
                    : variant.quantity ?? 0,
                tax: variant.tax ?? undefined,
                discountedPrice: variant.discountedPrice ?? undefined
              }))
            }
          })
          console.log('在庫の変更が完了しました:', data)
          await sleep(1000)
          alert('在庫の変更が完了しました')
          window.location.reload()
        } catch (error) {
          console.error('在庫の変更に失敗しました:', error)
          alert('在庫の変更に失敗しました')
        }
      }
    })
  }

  const handleCloseNotification = () => {
    setShowNotification(false)
  }

  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.currentTarget.value)
  }

  const handleSortChange = (value: string, label: string) => {
    setSortOption(value)
    setSortLabel(label)
  }

  const handleMenuClose = () => {
    setActiveRow(null)
  }

  const toggleVariant = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setActiveRow(activeRow === id ? null : id)
  }

  useEffect(() => {
    if (selectAll) {
      setSelectedRows(products.map((product) => product.id))
    } else {
      setSelectedRows([])
    }
  }, [selectAll, products])

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
    await fetchCategoryWithProductsData.refetch()
  }

  return (
    <>
      <ProductForm
        opened={productFormOpened}
        onClose={productFormModalClose}
        handleRegisterProduct={handleRegisterProduct}
      />
      <ProductEditForm
        opened={productEditFormOpened}
        onClose={productEditFormModalClose}
        handleRegisterProduct={handleRegisterProduct}
        productData={editProductData}
      />
      {showNotification && (
        <Notification
          visible={showNotification}
          onClose={handleCloseNotification}
        />
      )}
      <Group justify="flex-end">
        <TextInput
          w={432}
          placeholder="キーワード・タグで検索"
          styles={{
            input: {
              background: '#F8F9FA'
            }
          }}
          leftSection={
            <IconSearch size={20} stroke={2} color={theme.colors.gray[5]} />
          }
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <Button
          leftSection={<IconPlus size={16} stroke={2} />}
          ml={16}
          onClick={() => handleProductFormClick()}
        >
          商品登録
        </Button>
      </Group>
      <Group justify="space-between" mt={24} mb={20}>
        <Group>
          <Checkbox
            label="全て選択"
            checked={selectAll}
            onChange={(event) => setSelectAll(event.currentTarget.checked)}
          />
          <Menu shadow="md" width={200} withArrow position="bottom-start">
            <Menu.Target>
              <Button
                rightSection={<IconChevronDown size={16} stroke={2} />}
                disabled={selectedRows.length === 0}
              >
                {selectedRows.length}件選択中
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>操作を選択してください</Menu.Label>
              <Menu.Item
                onClick={() => handleMultiProductPublicationStatus(false)}
              >
                公開にする
              </Menu.Item>
              <Menu.Item
                onClick={() => handleMultiProductPublicationStatus(true)}
              >
                公開停止
              </Menu.Item>
              <Menu.Item onClick={handleMultiDuplicateProducts}>複製</Menu.Item>
              <Menu.Item
                color="red.6"
                disabled={selectedRows.some(
                  (id) =>
                    products.find((product) => product.id === id)?.isPublished
                )}
                onClick={handleMultiDeleteProducts}
              >
                消去
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Menu shadow="md" width={192} withArrow position="bottom-start">
            <Menu.Target>
              <Button
                leftSection={<IconAdjustments size={16} stroke={1} />}
                variant="default"
                fw={400}
              >
                {sortLabel}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>並び替え</Menu.Label>
              {SORT_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.value}
                  onClick={() => handleSortChange(option.value, option.label)}
                >
                  {sortOption === option.value && (
                    <IconCheck
                      size={14}
                      stroke={3}
                      style={{ marginRight: 5 }}
                    />
                  )}
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Group>
          <Text size="sm">
            {(page - 1) * pageSize + 1} -{' '}
            {page * pageSize < total ? page * pageSize : total} / {total}
          </Text>
          <Pagination
            size="sm"
            total={totalPages}
            value={page}
            onChange={handlePageChange}
          />
        </Group>
      </Group>
      <Grid gutter="lg">
        {currentProducts.map((product) => (
          <Grid.Col
            span={{ base: 12, xs: 6, sm: 12, md: 6, lg: 4, xl: 3 }}
            key={product.id}
          >
            <Card
              h="100%"
              withBorder
              p="sm"
              style={{ cursor: 'pointer' }}
              miw={260}
              onClick={() => handleProductClick(product)}
            >
              <Group
                mb="8"
                justify="space-between"
                onClick={(e) => e.stopPropagation()}
              >
                <Group gap={11}>
                  <Checkbox
                    checked={selectedRows.includes(product.id)}
                    onChange={(e) => {
                      const isChecked = e.currentTarget.checked
                      setSelectedRows((prev) =>
                        isChecked
                          ? [...prev, product.id]
                          : prev.filter((id) => id !== product.id)
                      )
                    }}
                  />
                  <Group gap={5}>
                    <Text fz={12}>在庫</Text>
                    <NumberInput
                      size="xs"
                      defaultValue={
                        product.variants.find(
                          (variant, index) =>
                            variant.displayOrder === 1 &&
                            variant.unitType === $Enums.ProductUnitType.WHOLE
                        )?.quantity ??
                        product.variants[0]?.quantity ??
                        0
                      }
                      value={localStockValues[product.id]}
                      onChange={(value) =>
                        handleLocalStockChange(product.id, Number(value))
                      }
                      w={55}
                    />
                  </Group>
                  <Button
                    size="compact-sm"
                    onClick={() => {
                      handleTotalStockChange(
                        localStockValues[product.id],
                        product
                      )
                    }}
                  >
                    更新
                  </Button>
                </Group>
                <Group gap={6}>
                  <Switch
                    checked={product.isPublished}
                    label="公開"
                    size="xs"
                    styles={{
                      label: {
                        paddingLeft: '7px'
                      }
                    }}
                    onChange={() => {
                      if (product.isPublished) {
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
                              product.id,
                              product.isPublished
                            )
                          }
                        })
                      } else {
                        modals.openConfirmModal({
                          title: '確認',
                          centered: true,
                          children: (
                            <Text size="sm">
                              この商品を公開してもよろしいですか？
                            </Text>
                          ),
                          labels: { confirm: 'はい', cancel: 'いいえ' },
                          onCancel: () => modals.closeAll(),
                          onConfirm: async () => {
                            await handleProductPublicationStatus(
                              product.id,
                              product.isPublished
                            )
                          }
                        })
                      }
                    }}
                  />
                  <Menu
                    withinPortal
                    position="bottom-end"
                    shadow="md"
                    onClose={handleMenuClose}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant={
                          activeRow === product.id ? 'blue.6' : 'transparent'
                        }
                        onClick={(event) => toggleVariant(product.id, event)}
                      >
                        <IconDots
                          size={20}
                          stroke={2}
                          color={activeRow === product.id ? '#fff' : '#354052'}
                        />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>操作を選択してください</Menu.Label>
                      <Menu.Item
                        onClick={() => handleDuplicateProduct(product.id)}
                      >
                        複製
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => handleEditProductFormClick(product)}
                      >
                        編集
                      </Menu.Item>
                      <Menu.Item
                        color={'red.6'}
                        disabled={product.isPublished}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        消去
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
              <Box
                bg="gray.3"
                style={{ borderRadius: '4px' }}
                pb="30"
                pt="8"
                mb="12"
              >
                <Group px={12} gap={5}>
                  {PRODUCT_BADGES.filter(({ label }) =>
                    checkBadgeCondition(label, product)
                  ).map(({ label, color }) => (
                    <Badge key={label} color={color} fz={10}>
                      {label}
                    </Badge>
                  ))}
                  {PRODUCT_BADGES.every(
                    ({ label }) => !checkBadgeCondition(label, product)
                  ) && <Box h={20} />}
                </Group>
                <Image h={188} src={product.images[0]?.url} mt="7" />
              </Box>
              <Box>
                <Flex justify="space-between">
                  <Title order={2} fz={14} c="gray.8" fw={700}>
                    {product.name}
                  </Title>
                  <Badge
                    color={product.isPublished ? 'blue.6' : 'red.6'}
                    fz={10}
                    style={{ flexShrink: '0' }}
                  >
                    {product.isPublished ? '公開中' : '非公開'}
                  </Badge>
                </Flex>
                <Group gap={5} my={6}>
                  <Text fz="md" fw={700} c="gray.8">
                    ¥{product.variants[0]?.price.toLocaleString()}~
                  </Text>
                  <Text fz={10} c="gray.8">
                    /{product.unit}
                  </Text>
                </Group>
                <Flex justify="space-between" align="center" wrap="wrap">
                  <Rating
                    value={RANK_MAPPING[product.rank]}
                    size="xs"
                    readOnly
                  />
                  <Group gap={1}>
                    <IconMapPin size={12} color={theme.colors.gray[6]} />
                    <Text c="gray.6" size="xs">
                      {product.origin}
                    </Text>
                  </Group>
                </Flex>
                <Text c="gray.6" size="xs" mt={10}>
                  {new Date(product.updatedAt).toLocaleString(
                    'ja-JP',
                    DATE_FORMAT_OPTIONS
                  )}{' '}
                  最終更新
                </Text>
              </Box>
            </Card>
            <ProductDetail
              key={selectedProduct?.id}
              product={selectedProduct}
              opened={productDetailModalOpened}
              onEditFormOpen={handleEditProductFormClick}
              onClose={() => {
                setSelectedProduct(null)
                productDetailModalClose()
              }}
              handleDeleteProduct={(product) =>
                handleDeleteProduct(product?.id ?? 0)
              }
              handleDuplicateProduct={handleDuplicateProduct}
              handleProductPublicationStatus={handleProductPublicationStatus}
            />
          </Grid.Col>
        ))}
      </Grid>
      <Group justify="flex-end" mt={10}>
        <Text size="sm">
          {(page - 1) * pageSize + 1} -{' '}
          {page * pageSize < total ? page * pageSize : total} / {total}
        </Text>
        <Pagination
          size="sm"
          total={totalPages}
          value={page}
          onChange={handlePageChange}
        />
      </Group>
    </>
  )
}
