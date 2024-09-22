import { Modal, Flex, Button, Text } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { ImageUpload } from './ImageUpload'
import { ProductInfo } from './ProductInfo'
import { ProductDescription } from './ProductDescription'
import { ProductPricing } from './ProductPricing'
import { ErrorModal } from './ErrorModal'
import { clientApi } from '~/lib/trpc/client-api'
import { useEffect, useState, useMemo } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useDisclosure } from '@mantine/hooks'
import type { AllProductsType } from '~/@types/product'
import {
  type Variant,
  convertProductDataToEditFormData,
  sortVariants,
  sleep
} from '~/util'
import { ProductUnitType, RankEnum } from '@prisma/client'
import { z } from 'zod'
import { modals } from '@mantine/modals'

const variantSchema = z.object({
  id: z.number().optional(),
  salesFormat: z.string().min(1, { message: '売り方・単価は必須です' }),
  unitType: z.nativeEnum(ProductUnitType),
  price: z.number().min(0, { message: '価格は必須です' }),
  tax: z.number().min(0),
  discountedPrice: z.number().min(0).optional(),
  quantity: z.number().min(0, { message: '在庫数は必須です' }),
  displayOrder: z.number().optional()
})

const optionalVariantSchema = variantSchema.partial()

export const productFormSchema = z
  .object({
    name: z.string().min(1, { message: '商品名は必須です' }),
    categories: z.array(z.number()),
    tags: z.array(z.number()),
    recommendTags: z.array(z.number()),
    rank: z
      .nativeEnum(RankEnum)
      .refine((val) => Object.values(RankEnum).includes(val), {
        message: '星は必須です'
      }),
    origin: z.string().min(1, { message: '産地は必須です' }),
    unit: z.string().min(1, { message: '販売単位は必須です' }),
    description: z.string().min(1, { message: '商品詳細は必須です' }),
    isRecommended: z.boolean(),
    pricingType: z.string().min(1, { message: '売り方・単価は必須です' }),
    separateBackBelly: z.boolean(),
    isPublished: z.boolean(),
    variants: z.array(variantSchema),
    images: z.array(z.object({ url: z.string().url() })).optional()
  })
  .superRefine((data, ctx) => {
    if (data.pricingType !== '魚') {
      for (let i = 1; i < data.variants.length; i++) {
        const variant = data.variants[i]
        const parsed = optionalVariantSchema.safeParse(variant)
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `variantsのインデックス${i}の要素はすべてオプショナルですが、有効な値が必要です`,
            path: ['variants', i]
          })
        }
      }
    }
    data.variants.forEach((variant, index) => {
      if (
        variant.discountedPrice !== undefined &&
        variant.discountedPrice > variant.price
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `割引金額は単価以下の金額を設定してください (インデックス: ${index})`,
          path: ['variants', index, 'discountedPrice']
        })
      }
      if (data.pricingType === '魚') {
        const wholeVariant = data.variants.find(
          (variant) => variant.unitType === 'WHOLE'
        )
        if (wholeVariant && wholeVariant.price === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '全体の単価を設定してください',
            path: ['variants', 0, 'price']
          })
        }
      } else {
        if (data.variants[0] && data.variants[0].price === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '単価を設定してください',
            path: ['variants', 0, 'price']
          })
        }
      }
      if (data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '少なくとも1つのバリエーションが必要です',
          path: ['variants']
        })
      }
    })
  })

export type ProductFormValues = z.infer<typeof productFormSchema>

/**
 * 編集用のフォーム
 * 公開時と非公開時に操作の制限をかける
 *  */
export const ProductEditForm = ({
  opened,
  onClose,
  handleRegisterProduct,
  productData
}: {
  opened: boolean
  onClose: () => void
  handleRegisterProduct: (data: ProductFormValues) => void
  productData: AllProductsType | null
}) => {
  const [editFiles, setEditFiles] = useState<string[]>([])
  const [errorMessages, setErrorMessages] = useState(['エラーはありません'])
  const [defaultValues, setDefaultValues] = useState<ProductFormValues>(
    convertProductDataToEditFormData(
      productData as AllProductsType
    ) as ProductFormValues
  )
  const [isChanged, setIsChanged] = useState(false)
  const [errorOpened, { close: errorClose, open: errorOpen }] =
    useDisclosure(false)

  const [isConfirm, setIsConfirm] = useState(false)
  const [confirmOpened, { close: confirmClose, open: confirmOpen }] =
    useDisclosure(false)

  const updateProductMutation = clientApi.product.update.useMutation()

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = methods

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      const images = editFiles.map((file) => ({ url: file }))
      if (!productData?.id) {
        throw new Error('Product ID is missing')
      }
      const updatedVariants = data.variants.map((variant, index) => ({
        ...variant,
        id: productData.variants[index]?.id
      }))
      const updatedData = {
        data: {
          ...data,
          variants: updatedVariants,
          images
        },
        id: productData.id
      }
      await updateProductMutation.mutateAsync(updatedData)

      handleRegisterProduct(data)
      onClose()
      await sleep(1000)
      window.location.reload()
    } catch (error) {
      console.error('商品の更新中にエラーが発生しました:', error)
      alert('商品の更新に失敗しました。もう一度お試しください。')
    }
  }

  const handleFilesChange = (files: string[]) => {
    setEditFiles(files)
    setIsChanged(true)
  }

  const handleReset = (data?: ProductFormValues) => {
    if (isChanged) {
      modals.openConfirmModal({
        title: '確認',
        centered: true,
        children: <Text size="sm">内容をリセットしてもよろしいですか？</Text>,
        labels: { confirm: 'はい', cancel: 'いいえ' },
        onCancel: () => {
          setIsChanged(false)
        },
        onConfirm: () => {
          if (!data) {
            reset(defaultValues)
          } else {
            reset(data)
          }
          setEditFiles(productData?.images.map((image) => image.url) ?? [])
          setIsChanged(false)
        }
      })
    } else {
      if (!data) {
        reset(defaultValues)
      } else {
        reset(data)
      }
      setEditFiles(productData?.images.map((image) => image.url) ?? [])
    }
  }

  const closeModalAndResetForm = () => {
    if (isChanged) {
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
          setIsChanged(false)
        }
      })
    } else {
      onClose()
    }
  }

  useEffect(() => {
    if (productData) {
      console.log(productData)
      setDefaultValues(
        convertProductDataToEditFormData(productData) as ProductFormValues
      )
      reset(convertProductDataToEditFormData(productData) as ProductFormValues)
      const imagesData = productData?.images.map((image) => image.url) ?? []
      setEditFiles(imagesData)
    }
  }, [productData])

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
        title="商品編集"
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
        <ConfirmModal
          texts={['修正必要', '']}
          confirmOpened={confirmOpened}
          confirmClose={confirmClose}
          setConfirm={setIsConfirm}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 表示の処理とクローズの処理を追加する */}
          <ErrorModal
            errors={errorMessages}
            errorOpened={errorOpened}
            errorClose={errorClose}
          />
          <ImageUpload
            onFilesChange={handleFilesChange}
            files={editFiles}
            setFiles={setEditFiles}
            isEditForm={true}
            setIsChanged={setIsChanged}
          />
          <ProductInfo
            register={register}
            errors={errors}
            control={control}
            isEditForm={true}
            setIsChanged={setIsChanged}
          />
          <ProductPricing
            control={control}
            errors={errors}
            isEditForm={true}
            product={
              convertProductDataToEditFormData(
                productData as AllProductsType
              ) as ProductFormValues
            }
            setIsChanged={setIsChanged}
          />
          <ProductDescription
            errors={errors}
            control={control}
            isEditForm={true}
            setIsChanged={setIsChanged}
          />
          <Flex gap="8" mt="24">
            <Button
              fullWidth
              variant="outline"
              onClick={() => handleReset(defaultValues)}
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
