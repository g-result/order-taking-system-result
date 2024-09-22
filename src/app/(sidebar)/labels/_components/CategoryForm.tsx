import {
  TextInput,
  Button,
  Group,
  Modal,
  Text,
  Flex,
  Stack,
  Select,
  ColorPicker,
  Box,
  Image
} from '@mantine/core'
import type { SelectProps } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconCheck } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { Category as CategoryType } from '@prisma/client'
import { clientApi } from '~/lib/trpc/client-api'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categoryIconMap } from '@/const/CategoryIcons'
import React from 'react'

type IconOption = {
  value: string
  label: string
  icon: React.ReactNode | string
}

const getIconOptions = (): IconOption[] => {
  return Object.keys(categoryIconMap).map((key) => {
    const isCrabOrShell = key === 'crab' || key === 'shell'
    const imagePath = isCrabOrShell ? (categoryIconMap[key] as string) : ''
    console.log(key)
    const icon = isCrabOrShell
      ? React.createElement(categoryIconMap[key])
      : imagePath
    return {
      value: key,
      label: key.replace(/_/g, ' '),
      icon: React.createElement(categoryIconMap[key])
    }
  })
}
const iconOptions = getIconOptions()

const renderSelectOption: SelectProps['renderOption'] = ({
  option,
  checked
}) => (
  <Group>
    {option.value !== 'crab' && option.value !== 'shell' ? (
      iconOptions.find((item) => item.value === option.value)?.icon
    ) : (
      <Image
        src={categoryIconMap[option.value]}
        alt={option.label}
        width={24}
        height={24}
      />
    )}
    <span>{option.label}</span>
    {checked && <IconCheck size={16} />}
  </Group>
)

// カテゴリフォーム用のZodスキーマ
const categorySchema = z.object({
  name: z.string().min(1, { message: 'カテゴリ名は必須です' }),
  icon: z.string().min(1, { message: 'アイコンは必須です' }),
  color: z.string()
})
type CategoryFormData = z.infer<typeof categorySchema>

export default function CategoryForm({
  opened,
  onClose,
  setCategories,
  setPage,
  setTotal,
  setTotalPages,
  pageSize,
  initialFormData
}: {
  opened: boolean
  onClose: () => void
  setCategories: (categories: CategoryType[]) => void
  setPage: (page: number) => void
  setTotal: (total: number) => void
  setTotalPages: (totalPages: number) => void
  pageSize: number
  initialFormData: CategoryType | null
}) {
  const [colorValue, setColorValue] = useState(
    initialFormData?.color || '#1c3c4a'
  )

  const [changeFlg, setChangeFlg] = useState(false)
  const createCategoryMutation = clientApi.category.create.useMutation()
  const updateCategoryMutation = clientApi.category.update.useMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialFormData?.name || '',
      icon: initialFormData?.iconUrl || '',
      color: initialFormData?.color || ''
    }
  })

  useEffect(() => {
    if (initialFormData) {
      setValue('name', initialFormData.name)
      setValue('icon', initialFormData.iconUrl || '')
      setValue('color', initialFormData.color || '')
    } else {
      reset()
    }
    setChangeFlg(false)
  }, [initialFormData])

  const onCategorySubmit = async (data: CategoryFormData) => {
    const mutationFunction = async () => {
      const payload = {
        ...data,
        name: data.name,
        iconUrl: data.icon,
        color: data.color || colorValue
      }
      if (initialFormData) {
        return await updateCategoryMutation.mutateAsync({
          ...payload,
          id: initialFormData.id
        })
      }
      return await createCategoryMutation.mutateAsync(payload)
    }

    try {
      const resultCategories = await mutationFunction()
      const resultCategoryRecords = resultCategories.categories.map(
        (record) => {
          return {
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }
        }
      )
      setCategories(resultCategoryRecords)
      setPage(1) // 最初のページに戻す
      setTotal(resultCategories.total)
      setTotalPages(Math.ceil(resultCategories.total / pageSize))
      reset()
      setChangeFlg(false)
      onClose()
    } catch (error) {
      reset()
      setChangeFlg(false)
      console.error('Error creating category:', error)
      alert(
        `カテゴリーの${
          initialFormData ? '更新' : '作成'
        }中にエラーが発生しました。もう一度お試しください。`
      )
    }
  }

  const handleClose = () => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: (
        <Text size="sm">
          ウィンドウを閉じて登録内容を破棄してもよろしいですか？
        </Text>
      ),
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {},
      onConfirm: () => {
        if (initialFormData) {
          setValue('name', initialFormData.name)
          setValue('icon', initialFormData.iconUrl || '')
          setValue('color', initialFormData.color || '')
        } else {
          reset()
        }
        onClose()
        setChangeFlg(false)
      }
    })
  }

  const handleReset = () => {
    if (!changeFlg) {
      return
    }
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">内容をリセットしてもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {},
      onConfirm: () => {
        if (initialFormData) {
          setValue('name', initialFormData.name)
          setValue('icon', initialFormData.iconUrl || '')
          setValue('color', initialFormData.color || '')
        } else {
          reset()
        }
        setChangeFlg(false)
      }
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="576"
      title={initialFormData ? 'カテゴリ編集' : 'カテゴリ登録'}
      centered
      overlayProps={{
        backgroundOpacity: 0.4
      }}
      styles={{
        body: {
          padding: '24px'
        }
      }}
    >
      <Stack>
        <Select
          label="アイコン"
          placeholder="選択してください"
          maw={170}
          required
          readOnly={isSubmitting}
          error={errors.icon?.message}
          value={watch('icon') || ''}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
          data={iconOptions.map((option) => ({
            value: option.value,
            label: option.label,
            icon: option.icon
          }))}
          renderOption={renderSelectOption}
          {...register('icon', { required: true })}
          onChange={(value) => {
            console.log(value)
            setValue('icon', value || '')
            setChangeFlg(true)
          }}
        />
        <TextInput
          label="カテゴリ名"
          placeholder=""
          required
          readOnly={isSubmitting}
          error={errors.name?.message}
          {...register('name', { required: true })}
          onChange={(e) => {
            setValue('name', e.target.value)
            setChangeFlg(true)
          }}
          value={watch('name') || ''}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
        <Box>
          <Text size="sm" fw="700">
            カラーコード <span style={{ color: 'red' }}>*</span>
          </Text>
          <Box
            p="sm"
            style={{
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              borderRadius: '4px'
            }}
          >
            <ColorPicker
              size="sm"
              fullWidth
              format="hex"
              value={watch('color') || colorValue}
              onChange={(color) => {
                setValue('color', color || '')
                setColorValue(color)
                setChangeFlg(true)
              }}
              swatches={[
                '#FF2F01',
                '#05ABFF',
                '#B7FF01',
                '#FF0133',
                '#FF01AD',
                '#E89623',
                '#403B3B',
                '#734343',
                '#A41D1D',
                '#BC5454',
                '#50BF3D',
                '#61CCD2',
                '#3EABC2',
                '#AB30D7',
                '#482179'
              ]}
              swatchesPerRow={30}
            />
            <Text ta="center" fz="xs" mt={7}>
              {watch('color') || colorValue}
            </Text>
          </Box>
        </Box>
      </Stack>
      <Flex gap="8" mt="24">
        <Button fullWidth variant="outline" onClick={handleReset}>
          内容をリセットする
        </Button>
        <Button fullWidth onClick={handleSubmit(onCategorySubmit)}>
          {initialFormData ? '更新' : '保存'}
        </Button>
      </Flex>
    </Modal>
  )
}
