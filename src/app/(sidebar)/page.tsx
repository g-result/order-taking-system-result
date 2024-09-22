'use client'
import { Box, Flex, Switch, Title, Loader } from '@mantine/core'
import ProductCategoryTab from './_components/ProductCategoryTab'
import { ProductList } from './_components/ProductList'
import { useEffect, useState } from 'react'
import { clientApi } from '~/lib/trpc/client-api'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all')
  const [page, setPage] = useState(1)
  const [checked, setChecked] = useState(false)
  const { data: settings, isLoading } =
    clientApi.globalSettings.findFirst.useQuery()
  const globalSettingMutation = clientApi.globalSettings.upsert.useMutation()
  const handleSwitchChange = () => {
    setChecked((prev) => !prev)
    try {
      globalSettingMutation.mutateAsync({
        id: settings?.id ?? undefined,
        overrideUsageRestriction: !checked
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setChecked(settings?.overrideUsageRestriction ?? false)
  }, [settings])

  return (
    <Box c="dark.4">
      <Flex>
        <Title c="dark.4" size="lg" fw="bold" mb="32" mr="20">
          商品管理
        </Title>
        {isLoading ? (
          <Loader color="blue" />
        ) : (
          <Switch
            checked={checked}
            onChange={handleSwitchChange}
            label="公開制限の無効化"
          />
        )}
      </Flex>
      <ProductCategoryTab
        onCategoryChange={(category) => {
          setSelectedCategory(category)
          setPage(1)
        }}
        setPage={setPage}
      />
      <ProductList
        selectedCategory={selectedCategory}
        page={page}
        setPage={setPage}
      />
    </Box>
  )
}
