import { Tabs } from '@mantine/core'
import CategoryList from './CategoryList'
import TagList from './TagList'
import RelatedTagList from './RelatedTagList'

export default function TabsComponent() {
  const categories = [
    { value: 'cate', label: 'カテゴリ', component: CategoryList },
    { value: 'tag', label: 'タグ', component: TagList },
    { value: 'related-tags', label: '関連タグ', component: RelatedTagList }
  ]
  return (
    <Tabs
      variant="outline"
      defaultValue="cate"
      orientation="horizontal"
      mb="md"
    >
      <Tabs.List mb="24">
        {categories.map((category) => (
          <Tabs.Tab key={category.value} value={category.value}>
            {category.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {categories.map((category) => (
        <Tabs.Panel key={category.value} value={category.value}>
          <category.component />
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
