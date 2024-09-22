import { Modal, Flex, Button, Text } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { ImageUpload } from './ImageUpload'
import { ProductInfo } from './ProductInfo'
import { ProductDescription } from './ProductDescription'
import { ProductPricing } from './ProductPricing'
import { clientApi } from '~/lib/trpc/client-api'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useDisclosure } from '@mantine/hooks'
import { sleep } from '~/util'
import { ErrorModal } from './ErrorModal'
import { DEFAULTPRODUCTFORMVALUES } from '@/const/config'
import { productFormSchema, type ProductFormValues } from './EditForm'
import { modals } from '@mantine/modals'

export const ProductForm = ({
  opened,
  onClose,
  handleRegisterProduct
}: {
  opened: boolean
  onClose: () => void
  handleRegisterProduct: (data: ProductFormValues) => void
}) => {
  const [files, setFiles] = useState<string[]>([])
  const [isConfirm, setIsConfirm] = useState(false)
  const [errorMessages, setErrorMessages] = useState(['エラーはありません'])
  const [confirmOpened, { close: confirmClose, open: confirmOpen }] =
    useDisclosure(false)
  const [errorOpened, { close: errorClose, open: errorOpen }] =
    useDisclosure(false)

  const defaultValues: ProductFormValues = DEFAULTPRODUCTFORMVALUES

  const createProductMutation = clientApi.product.create.useMutation()

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, dirtyFields }
  } = methods

  const isDirty = Object.keys(dirtyFields).length > 0

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      const images = files.map((file) => ({ url: file }))

      const response = await createProductMutation.mutateAsync({
        ...data,
        images
      })
      handleRegisterProduct(data)
      onClose()
      await sleep(1000)
      window.location.reload()
    } catch (error) {
      console.error(error)
      handleRegisterProduct(data)
      onClose()
    }
  }

  const handleFilesChange = (files: string[]) => {
    setFiles(files)
  }

  const handleReset = () => {
    if (isDirty || files.length > 0) {
      modals.openConfirmModal({
        title: '確認',
        centered: true,
        children: <Text size="sm">内容をリセットしてもよろしいですか？</Text>,
        labels: { confirm: 'はい', cancel: 'いいえ' },
        onCancel: () => {},
        onConfirm: () => {
          reset(defaultValues)
          setFiles([])
        }
      })
    } else {
      reset(defaultValues)
      setFiles([])
    }
  }

  const closeModalAndResetForm = () => {
    if (isDirty || files.length > 0) {
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
          onClose()
          reset(defaultValues)
        }
      })
    } else {
      onClose()
    }
  }

  useEffect(() => {
    if (opened) {
      reset(defaultValues)
    }
  }, [opened])

  const onError = useMemo(() => {
    const errorMessages = Object.values(errors).map((error) => error.message)
    if (errorMessages.length === 0) return
    const validErrorMessages = errorMessages.filter(
      (error): error is string => error !== undefined
    )
    setErrorMessages(validErrorMessages)
    errorOpen()
  }, [errors])

  return (
    <FormProvider {...methods}>
      <Modal
        opened={opened}
        onClose={closeModalAndResetForm}
        size="945"
        c="dark.4"
        title="商品登録"
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
        {/* 表示の処理とクローズの処理を追加する */}
        <ErrorModal
          errors={errorMessages}
          errorOpened={errorOpened}
          errorClose={errorClose}
        />
        <ConfirmModal
          texts={['修正必要', '']}
          confirmOpened={confirmOpened}
          confirmClose={confirmClose}
          setConfirm={setIsConfirm}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ImageUpload
            onFilesChange={handleFilesChange}
            files={files}
            setFiles={setFiles}
          />
          <ProductInfo register={register} errors={errors} control={control} />
          <ProductPricing control={control} errors={errors} />
          <ProductDescription errors={errors} control={control} />
          <Flex gap="8" mt="24">
            <Button
              fullWidth
              variant="outline"
              onClick={handleReset}
              type="reset"
            >
              内容をリセットする
            </Button>
            <Button fullWidth type="submit">
              保存
            </Button>
          </Flex>
        </form>
      </Modal>
    </FormProvider>
  )
}
