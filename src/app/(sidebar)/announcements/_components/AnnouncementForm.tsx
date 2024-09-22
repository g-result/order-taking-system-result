import {
  Button,
  Modal,
  Flex,
  Stack,
  Text,
  Textarea,
  Checkbox,
  TextInput
} from '@mantine/core'
import '@mantine/dates/styles.css'
import { DateTimePicker } from '@mantine/dates'
import type { News as NewsType } from '@prisma/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { clientApi } from '~/lib/trpc/client-api'
import 'dayjs/locale/ja'
import { modals } from '@mantine/modals'

const announcementSchema = z.object({
  title: z.string().min(1, { message: 'タイトルは必須です' }),
  content: z.string().min(1, { message: 'お知らせ内容は必須です' }),
  publishedAt: z.date({ required_error: '公開開始日時は必須です' }),
  publishedEndAt: z.date({ required_error: '公開終了日時は必須です' })
})
type AnnouncementFormData = z.infer<typeof announcementSchema>

export default function AnnouncementForm({
  opened,
  onClose,
  setAnnouncements,
  setPage,
  setTotal,
  setTotalPages,
  pageSize,
  initialFormData
}: {
  opened: boolean
  onClose: () => void
  setAnnouncements: (announcements: NewsType[]) => void
  setPage: (page: number) => void
  setTotal: (total: number) => void
  setTotalPages: (totalPages: number) => void
  pageSize: number
  initialFormData: NewsType | null
}) {
  const [changeFlg, setChangeFlg] = useState(false)
  const [isImmediate, setIsImmediate] = useState(false)
  const createAnnouncementMutation = clientApi.news.create.useMutation()
  const updateAnnouncementMutation = clientApi.news.update.useMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: initialFormData?.title || '',
      content: initialFormData?.content || '',
      publishedAt: initialFormData?.publishedAt || new Date(),
      publishedEndAt: initialFormData?.publishedEndAt || new Date()
    }
  })

  useEffect(() => {
    if (initialFormData) {
      setValue('title', initialFormData.title)
      setValue('content', initialFormData.content || '')
      setValue('publishedAt', initialFormData.publishedAt || '')
      setValue('publishedEndAt', initialFormData.publishedEndAt || '')
    } else {
      reset()
    }
    setChangeFlg(false)
  }, [initialFormData])

  const onAnnouncementSubmit = async (data: AnnouncementFormData) => {
    if (isImmediate) {
      const now = new Date()
      data.publishedAt = now
    }
    const mutationFunction = async () => {
      const payload = {
        ...data,
        title: data.title,
        content: data.content,
        publishedAt: data.publishedAt,
        publishedEndAt: data.publishedEndAt
      }
      if (initialFormData) {
        return await updateAnnouncementMutation.mutateAsync({
          ...payload,
          id: initialFormData.id,
          publishedAt: payload.publishedAt.toISOString(),
          publishedEndAt: payload.publishedEndAt.toISOString()
        })
      }
      return await createAnnouncementMutation.mutateAsync({
        ...payload,
        publishedAt: payload.publishedAt.toISOString(),
        publishedEndAt: payload.publishedEndAt.toISOString()
      })
    }

    try {
      const resultAnnouncements = await mutationFunction()
      const resultAnnouncementRecords = resultAnnouncements.map((record) => {
        return {
          ...record
        }
      })
      setAnnouncements(resultAnnouncementRecords)
      setPage(1) // 最初のページに戻す
      setTotal(resultAnnouncements.length)
      setTotalPages(Math.ceil(resultAnnouncements.length / pageSize))
      reset()
      setChangeFlg(false)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating Announcement:', error.message)
      } else {
        console.error('Error creating Announcement:', error)
      }
      reset()
      setChangeFlg(false)
      console.error('Error creating Announcement:', error)
      alert(
        `お知らせの${
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
          setValue('title', initialFormData.title)
          setValue('content', initialFormData.content || '')
          setValue('publishedAt', initialFormData.publishedAt || '')
          setValue('publishedEndAt', initialFormData.publishedEndAt || '')
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
          setValue('title', initialFormData.title)
          setValue('content', initialFormData.content || '')
          setValue('publishedAt', initialFormData.publishedAt || '')
          setValue('publishedEndAt', initialFormData.publishedEndAt || '')
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
      size="945"
      title={initialFormData ? 'おしらせ編集' : 'おしらせ登録'}
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
      <Stack gap="lg">
        <TextInput
          label="タイトル"
          placeholder=""
          required
          readOnly={isSubmitting}
          error={errors.title?.message}
          {...register('title', { required: true })}
          onChange={(e) => {
            setValue('title', e.target.value)
            setChangeFlg(true)
          }}
          value={watch('title') || ''}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
        <Textarea
          label="お知らせ内容"
          required
          readOnly={isSubmitting}
          error={errors.content?.message}
          {...register('content', { required: true })}
          onChange={(e) => {
            setValue('content', e.target.value)
            setChangeFlg(true)
          }}
          value={watch('content') || ''}
          styles={{
            label: {
              fontWeight: 700
            },
            input: {
              height: 126
            }
          }}
        />
        <Checkbox
          label="即時配信する"
          checked={isImmediate}
          onChange={(e) => {
            setIsImmediate(e.currentTarget.checked)
            if (e.currentTarget.checked) {
              const now = new Date()
              setValue('publishedAt', now)
              setChangeFlg(true)
            }
          }}
        />
        <DateTimePicker
          locale="ja"
          label="公開開始日時"
          withAsterisk
          defaultValue={new Date()}
          maw={318}
          readOnly={isSubmitting}
          error={errors.publishedAt?.message}
          {...register('publishedAt', { required: true })}
          onChange={(date) => {
            setValue('publishedAt', date || new Date())
            setChangeFlg(true)
          }}
          value={watch('publishedAt') || ''}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
        <DateTimePicker
          locale="ja"
          label="公開終了日時"
          withAsterisk
          defaultValue={new Date()}
          maw={318}
          readOnly={isSubmitting}
          error={errors.publishedEndAt?.message}
          {...register('publishedEndAt', { required: true })}
          onChange={(date) => {
            setValue('publishedEndAt', date || new Date())
            setChangeFlg(true)
          }}
          value={watch('publishedEndAt') || ''}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
      </Stack>
      <Flex gap="8" mt="24">
        <Button fullWidth variant="outline" onClick={handleReset}>
          内容をリセットする
        </Button>
        <Button fullWidth onClick={handleSubmit(onAnnouncementSubmit)}>
          {initialFormData ? '更新' : '保存'}
        </Button>
      </Flex>
    </Modal>
  )
}
