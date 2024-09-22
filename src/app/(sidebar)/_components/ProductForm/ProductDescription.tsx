import { Stack, Textarea, Switch } from '@mantine/core'
import {
  type Control,
  Controller,
  type FieldErrors,
  useFormContext
} from 'react-hook-form'
import { useEditability } from '../../hooks'
import type { ProductFormValues } from './EditForm'

type ProductDescriptionProps = {
  errors: FieldErrors<ProductFormValues>
  control: Control<ProductFormValues>
  isEditForm?: boolean
  setIsChanged?: (isChanged: boolean) => void
}

export const ProductDescription = ({
  errors,
  control,
  isEditForm,
  setIsChanged
}: ProductDescriptionProps) => {
  const { isEditable } = useEditability()
  const { watch } = useFormContext()
  const isPublished = watch('isPublished')
  const isDisabled = isEditForm && !isEditable && isPublished

  return (
    <>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            label="商品詳細"
            required
            placeholder="この時期、寿都(すっつ)湾では、小さな海老が、多くそれを捕食する為、礼文や他の産地よりも、色も濃く、焼き上がりの香りが違い香ばしいです。"
            {...field}
            onChange={(e) => {
              field.onChange(e)
              setIsChanged?.(true)
            }}
            error={errors.description?.message}
            disabled={isDisabled}
            h={148}
            styles={{
              label: {
                fontWeight: 700
              },
              input: {
                height: 148
              }
            }}
          />
        )}
      />
      <Stack gap="8" mt="50">
        <Controller
          name="isRecommended"
          control={control}
          render={({ field }) => (
            <Switch
              label="おすすめ商品"
              size="sm"
              checked={field.value}
              onChange={(checked) => {
                field.onChange(checked)
                setIsChanged?.(true)
              }}
              disabled={isDisabled}
              styles={{
                label: {
                  paddingLeft: '7px'
                }
              }}
            />
          )}
        />
        <Controller
          name="isPublished"
          control={control}
          render={({ field }) => (
            <Switch
              label="公開"
              size="sm"
              checked={field.value}
              onChange={(checked) => {
                field.onChange(checked)
                setIsChanged?.(true)
              }}
              disabled={isDisabled}
              styles={{
                label: {
                  paddingLeft: '7px'
                }
              }}
            />
          )}
        />
      </Stack>
    </>
  )
}
