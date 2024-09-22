import {
  Stack,
  TextInput,
  MultiSelect,
  Flex,
  Badge,
  Select
} from '@mantine/core'
import {
  Controller,
  type UseFormRegister,
  type Control,
  type FieldErrors,
  useFormContext
} from 'react-hook-form'
import { clientApi } from '~/lib/trpc/client-api'
import {
  convertMultiSelectData,
  convertToNumberArray,
  convertToStringArray
} from '~/util'
import { useEditability } from '../../hooks'
import type { ProductFormValues } from './EditForm'

type ProductDetailsProps = {
  register: UseFormRegister<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  control: Control<ProductFormValues>
  isEditForm?: boolean
  setIsChanged?: (isChanged: boolean) => void
}

export const ProductInfo = ({
  register,
  errors,
  control,
  isEditForm,
  setIsChanged
}: ProductDetailsProps) => {
  const { data } = clientApi.label.getAll.useQuery()
  const { isEditable } = useEditability()
  const { watch } = useFormContext()
  const isPublished = watch('isPublished')
  const isDisabled = isEditForm && !isEditable && isPublished

  const categories = data?.categories || []
  const tags = data?.tags || []
  const recommendTags = data?.recommendTags || []

  const CATEGORIES_DATA = convertMultiSelectData(categories)
  const TAGS_DATA = convertMultiSelectData(tags)
  const RECOMMEND_TAGS_DATA = convertMultiSelectData(recommendTags)

  return (
    <Stack gap="20">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextInput
            label="商品名"
            required
            placeholder="極上サクラマス桜寿(おうじゅ)"
            mt="10"
            {...field}
            onChange={(e) => {
              field.onChange(e)
              setIsChanged?.(true)
            }}
            error={errors.name?.message}
            disabled={isDisabled}
            styles={{
              label: {
                fontWeight: 700
              }
            }}
          />
        )}
      />
      <Controller
        name="categories"
        control={control}
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            label="カテゴリ"
            placeholder={'選択してください'}
            required
            data={CATEGORIES_DATA}
            value={convertToStringArray(value)}
            onChange={(value) => {
              onChange(convertToNumberArray(value))
              setIsChanged?.(true)
            }}
            error={errors.categories?.message}
            disabled={isDisabled}
            maw={374}
            styles={{
              label: {
                fontWeight: 700
              },
              input: {
                color: 'gray.7'
              }
            }}
          />
        )}
      />
      <Controller
        name="tags"
        control={control}
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            label="タグ"
            placeholder={'選択してください'}
            maw={434}
            data={TAGS_DATA}
            value={convertToStringArray(value)}
            onChange={(value) => {
              onChange(convertToNumberArray(value))
              setIsChanged?.(true)
            }}
            disabled={isDisabled}
            styles={{
              label: {
                fontWeight: 700
              }
            }}
          />
        )}
      />
      <Controller
        name="recommendTags"
        control={control}
        render={({ field: { value, onChange } }) => (
          <MultiSelect
            label="関連タグ"
            placeholder={'選択してください'}
            maw={434}
            data={RECOMMEND_TAGS_DATA}
            value={convertToStringArray(value)}
            onChange={(value) => {
              onChange(convertToNumberArray(value))
              setIsChanged?.(true)
            }}
            disabled={isDisabled}
            styles={{
              label: {
                fontWeight: 700
              }
            }}
          />
        )}
      />
      <Controller
        name="rank"
        control={control}
        render={({ field }) => (
          <Select
            label="星"
            required
            data={[
              { value: '', label: '選択してください', disabled: true },
              { value: 'ONE', label: '1' },
              { value: 'TWO', label: '2' },
              { value: 'THREE', label: '3' },
              { value: 'FOUR', label: '4' },
              { value: 'FIVE', label: '5' }
            ]}
            maw={170}
            {...field}
            onChange={(value) => {
              field.onChange(value)
              setIsChanged?.(true)
            }}
            error={errors.rank?.message}
            disabled={isDisabled}
            styles={{
              label: {
                fontWeight: 700
              },
              input: {
                color: 'gray.7'
              }
            }}
          />
        )}
      />
      <Flex align="flex-end">
        <Controller
          name="origin"
          control={control}
          render={({ field }) => (
            <TextInput
              label="産地"
              required
              placeholder="北海道"
              w={313}
              c="gray.7"
              {...field}
              onChange={(e) => {
                field.onChange(e)
                setIsChanged?.(true)
              }}
              error={errors.origin?.message}
              disabled={isDisabled}
              styles={{
                label: {
                  fontWeight: 700
                }
              }}
            />
          )}
        />
        <Badge
          w="34"
          h="36"
          color="gray.1"
          radius="4"
          fz="sm"
          c="#000"
          p="0"
          ml="5"
          styles={{
            root: {
              border: '1px solid #CED4DA'
            }
          }}
        >
          産
        </Badge>
      </Flex>
      <Controller
        name="unit"
        control={control}
        render={({ field }) => (
          <TextInput
            label="販売単位"
            placeholder="キロ"
            required
            {...field}
            onChange={(e) => {
              field.onChange(e)
              setIsChanged?.(true)
            }}
            maw={313}
            c="gray.7"
            error={errors.unit?.message}
            disabled={isDisabled}
            styles={{
              label: {
                fontWeight: 700
              }
            }}
          />
        )}
      />
    </Stack>
  )
}
