import { useEffect, useState } from 'react'
import { TextInput, Button, Modal, Text, Flex, Stack } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '~/lib/trpc/client-api'
import type { RecommendTag as TagType } from '@prisma/client'

// タグフォーム用のZodスキーマ
const tagSchema = z.object({
  name: z.string().min(1, { message: 'おすすめ関連タグ名は必須です' })
})
type TagFormData = z.infer<typeof tagSchema>

export default function RelatedTagForm({
  opened,
  onClose,
  setTags,
  setPage,
  setTotal,
  setTotalPages,
  pageSize,
  initialFormData
}: {
  opened: boolean
  onClose: () => void
  setTags: (tags: TagType[]) => void
  setPage: (page: number) => void
  setTotal: (total: number) => void
  setTotalPages: (totalPages: number) => void
  pageSize: number
  initialFormData: TagType | null
}) {
  const [changeFlg, setChangeFlg] = useState(false)
  const createRecommendTagMutation = clientApi.recommendTag.create.useMutation()
  const updateRecommendTagMutation = clientApi.recommendTag.update.useMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors }
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: initialFormData?.name || '' }
  })

  useEffect(() => {
    if (initialFormData) {
      setValue('name', initialFormData.name)
    } else {
      reset()
    }
  }, [initialFormData])

  const onTagSubmit = async (data: TagFormData) => {
    const mutationFunction = async () => {
      if (initialFormData) {
        return await updateRecommendTagMutation.mutateAsync({
          ...data,
          id: initialFormData.id
        })
      }
      return await createRecommendTagMutation.mutateAsync(data)
    }

    try {
      const resultTags = await mutationFunction()

      const resultTagRecords = resultTags.tags.map((record) => {
        return {
          ...record,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }
      })
      setTags(resultTagRecords)
      setPage(1) // 最初のページに戻す
      setTotal(resultTags.total)
      setTotalPages(Math.ceil(resultTags.total / pageSize))
      reset()
      setChangeFlg(false)
      onClose()
    } catch (error) {
      reset()
      setChangeFlg(false)
      console.error('Error creating tag:', error)
      alert(
        `タグの${
          initialFormData ? '更新' : '作成'
        }中にエラーが発生しました。もう一度お試しください。`
      )
    }
  }

  const handleClose = () => {
    !changeFlg && onClose()
    changeFlg &&
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
          } else {
            reset()
          }
          onClose()
          setChangeFlg(false)
        }
      })
  }

  const handleReset = () => {
    changeFlg &&
      modals.openConfirmModal({
        title: '確認',
        centered: true,
        children: (
          <Text size="sm">
            内容をリセットしてもよろしいですか？
            <br />
            （このダイアログが出るのはフォームに変更が加わった時だけです。）
          </Text>
        ),
        labels: { confirm: 'はい', cancel: 'いいえ' },
        onCancel: () => {},
        onConfirm: () => {
          if (initialFormData) {
            setValue('name', initialFormData.name)
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
      title={initialFormData ? 'タグ編集' : 'タグ登録'}
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
        <TextInput
          label="タグ名"
          placeholder=""
          {...register('name', { required: true })}
          readOnly={isSubmitting}
          error={errors.name?.message}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
          onChange={() => setChangeFlg(true)}
        />
      </Stack>
      <Flex gap="8" mt="24">
        <Button fullWidth variant="outline" onClick={handleReset}>
          内容をリセットする
        </Button>
        <Button fullWidth onClick={handleSubmit(onTagSubmit)}>
          保存
        </Button>
      </Flex>
    </Modal>
  )
}
