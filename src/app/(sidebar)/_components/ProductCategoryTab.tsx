import { Tabs } from '@mantine/core'
import type { Category } from '@prisma/client'
import { useEffect, useState } from 'react'
import { clientApi } from '~/lib/trpc/client-api'

export default function ProductCategoryTab({
  onCategoryChange,
  setPage
}: {
  onCategoryChange: (value: string | null) => void
  setPage: (page: number) => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const predefinedTabs = [{ key: 'all', value: 'all', label: '全て' }]

  const fetchCategoriesData = clientApi.category.list.useQuery()

  useEffect(() => {
    if (fetchCategoriesData.isSuccess && fetchCategoriesData.data) {
      const records = fetchCategoriesData.data
      setCategories(records)
    }
  }, [fetchCategoriesData.isSuccess, fetchCategoriesData.data])

  function handleCategoryChange(value: string | null) {
    onCategoryChange(value)
    setPage(1)
  }

  return (
    <Tabs
      variant="outline"
      defaultValue="all"
      orientation="horizontal"
      mb="xl"
      onChange={handleCategoryChange}
    >
      <Tabs.List>
        {predefinedTabs.map((tab) => (
          <Tabs.Tab key={tab.key} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
        {categories.map((category) => (
          <Tabs.Tab key={category.id} value={category.id.toString()}>
            {category.name}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  )
}
