import { Box, Text, Group, RadioGroup, Radio } from '@mantine/core'
import { useEffect, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  type Control,
  type FieldErrors
} from 'react-hook-form'
import { ProductPricingFish } from './ProductPricingFish'
import { ProductPricingOther } from './ProductPricingOther'
import { useEditability } from '../../hooks'
import type { ProductFormValues } from './EditForm'

type ProductPricingProps = {
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  isEditForm?: boolean
  product?: ProductFormValues
  setIsChanged?: (isChanged: boolean) => void
}

export const ProductPricing = ({
  control,
  errors,
  isEditForm,
  product,
  setIsChanged
}: ProductPricingProps) => {
  const { watch, setValue } = useFormContext<ProductFormValues>()
  const [initialLoad, setInitialLoad] = useState(true)
  const pricingType = watch('pricingType')
  const { isEditable } = useEditability()
  const isPublished = watch('isPublished')
  const isDisabled = isEditForm && !isEditable && isPublished

  useEffect(() => {
    if (!initialLoad) {
      if (pricingType === '魚') {
        if (isEditForm && product?.pricingType === '魚') {
          setValue('variants', product?.variants)
        } else {
          setValue('variants', [
            {
              salesFormat: '本',
              unitType: 'WHOLE',
              price: 0,
              tax: 10,
              discountedPrice: 0,
              quantity: 0,
              displayOrder: 1
            },
            {
              salesFormat: '',
              unitType: 'HALF_BODY',
              price: 1000,
              tax: 10,
              discountedPrice: 900,
              quantity: 1
            },
            {
              salesFormat: '',
              unitType: 'QUATER_BACK',
              price: 0,
              tax: 10,
              discountedPrice: 0,
              quantity: 1
            }
          ])
        }
      } else {
        setValue('variants', [
          {
            salesFormat: '',
            unitType: 'WHOLE',
            price: 0,
            tax: 10,
            discountedPrice: 0,
            quantity: 0,
            displayOrder: 1
          }
        ])
      }
    } else {
      setInitialLoad(false)
    }
  }, [pricingType, setValue])
  return (
    <>
      <Box mt="24">
        <Text size="sm" display="inline" fw="700">
          売り方・単価
        </Text>
        <Text c="red" size="sm" display="inline">
          {' '}
          *
        </Text>
      </Box>
      <Controller
        name="pricingType"
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              setIsChanged?.(true)
            }}
            required
          >
            <Group>
              <Radio
                value="魚"
                label="魚"
                disabled={
                  isDisabled || (isEditForm && field.value === 'その他')
                }
              />
              <Radio
                value="その他"
                label="その他"
                disabled={isDisabled || (isEditForm && field.value === '魚')}
              />
            </Group>
          </RadioGroup>
        )}
      />
      {pricingType === '魚' ? (
        <ProductPricingFish
          control={control}
          errors={errors}
          isDisabled={isDisabled}
          isEditForm={isEditForm}
          setIsChanged={setIsChanged}
        />
      ) : (
        <ProductPricingOther
          control={control}
          errors={errors}
          isDisabled={isDisabled}
          isEditForm={isEditForm}
          setIsChanged={setIsChanged}
        />
      )}
    </>
  )
}
