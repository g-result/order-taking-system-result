import {
  Box,
  Flex,
  Text,
  Group,
  NativeSelect,
  TextInput,
  Checkbox,
  NumberInput,
  Select
} from '@mantine/core'
import {
  Controller,
  useFieldArray,
  useFormContext,
  type Control,
  type FieldErrors
} from 'react-hook-form'
import { useEffect } from 'react'
import { ProductUnitType } from '@prisma/client'
import { YenBadge } from './YenBadge'
import type { ProductFormValues } from './EditForm'

type ProductPricingProps = {
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  isDisabled?: boolean
  isEditForm?: boolean
  setIsChanged?: (isChanged: boolean) => void
}

export const ProductPricingFish = ({
  control,
  errors,
  isDisabled,
  isEditForm,
  setIsChanged
}: ProductPricingProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  })

  // salesFormatの値を他のフィールドに反映するために準備
  const { watch, setValue } = useFormContext<ProductFormValues>()
  const separateBackBelly = watch('separateBackBelly')

  useEffect(() => {
    const quarterBackIndex = fields.findIndex(
      (field) => field.unitType === ProductUnitType.QUATER_BACK
    )
    const quarterBellyIndex = fields.findIndex(
      (field) => field.unitType === ProductUnitType.QUATER_BELLY
    )

    if (
      separateBackBelly &&
      quarterBackIndex !== -1 &&
      quarterBellyIndex === -1
    ) {
      append({
        salesFormat: '本',
        unitType: ProductUnitType.QUATER_BELLY,
        price: 0,
        tax: 10,
        discountedPrice: 0,
        quantity: 0
      })
    }

    if (!separateBackBelly && quarterBellyIndex !== -1) {
      remove(quarterBellyIndex)
    }
  }, [separateBackBelly, append, remove, fields])

  // 全体の売り方・単価を他のフィールドに反映
  const salesFormatWhole = watch('variants.0.salesFormat')
  useEffect(() => {
    if (salesFormatWhole) {
      fields.forEach((field, index) => {
        if (index > 0) {
          setValue(`variants.${index}.salesFormat`, salesFormatWhole)
        }
      })
    }
  }, [salesFormatWhole, setValue, fields])

  return (
    <>
      {fields.map((field, index) => (
        <Box
          key={field.id}
          style={{ border: '1px solid #dee2e6', borderRadius: 4 }}
          mt="4"
        >
          {index === 0 && (
            <Flex h="100%" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Box
                bg="gray.1"
                w={64}
                style={{
                  borderRight: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0'
                }}
              >
                <Box>
                  <Text
                    fw="700"
                    fz="sm"
                    mt="auto"
                    mb="auto"
                    style={{ display: 'inline' }}
                  >
                    全体
                  </Text>
                  <Text c="red" style={{ display: 'inline' }}>
                    {' '}
                    *
                  </Text>
                </Box>
              </Box>
              <Group p="8" grow wrap="nowrap" w="100%">
                <Controller
                  name={`variants.${index}.salesFormat`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      label="表示名"
                      data={[
                        {
                          value: '',
                          label: '選択してください',
                          disabled: true
                        },
                        { value: '枚', label: '枚' },
                        { value: '本', label: '本' },
                        { value: '匹', label: '匹' }
                      ]}
                      value={value}
                      onChange={(newValue) => {
                        onChange(newValue)
                        setIsChanged?.(true)
                      }}
                      error={errors?.variants?.[index]?.salesFormat?.message}
                      disabled={isDisabled}
                      c="gray.7"
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
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="単価"
                        placeholder="3500"
                        value={value}
                        hideControls
                        onChange={(newValue) => {
                          onChange(newValue)
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
                  <YenBadge />
                </Flex>
                <Flex align="flex-end">
                  <Controller
                    name={`variants.${index}.discountedPrice`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="割引価格"
                        placeholder="3000"
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue)
                          setIsChanged?.(true)
                        }}
                        hideControls
                        disabled={isDisabled}
                        styles={{
                          label: {
                            fontWeight: 700
                          }
                        }}
                      />
                    )}
                  />
                  <YenBadge />
                </Flex>
                <Controller
                  name={`variants.${index}.quantity`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <NumberInput
                      label="在庫"
                      value={value}
                      onChange={(newValue) => {
                        onChange(newValue)
                        setIsChanged?.(true)
                      }}
                      styles={{
                        label: {
                          fontWeight: 700
                        }
                      }}
                    />
                  )}
                />
              </Group>
            </Flex>
          )}
          {index === 1 && (
            <Flex h="100%" style={{ borderBottom: '1px solid #dee2e6' }}>
              <Box
                bg="gray.1"
                w={64}
                style={{
                  borderRight: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0'
                }}
              >
                <Box>
                  <Text
                    fw="700"
                    fz="sm"
                    mt="auto"
                    mb="auto"
                    style={{ display: 'inline' }}
                  >
                    半身
                  </Text>
                </Box>
              </Box>
              <Group p="8" grow wrap="nowrap" gap="xs" w="100%">
                <Flex align="flex-end" maw="none">
                  <Controller
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="単価"
                        placeholder="3500"
                        w="100%"
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue)
                          setIsChanged?.(true)
                        }}
                        hideControls
                        disabled={isDisabled}
                        styles={{
                          label: {
                            fontWeight: 700
                          }
                        }}
                      />
                    )}
                  />
                  <YenBadge />
                </Flex>
                <Flex align="flex-end" maw="none">
                  <Controller
                    name={`variants.${index}.discountedPrice`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="割引価格"
                        placeholder="3000"
                        w="100%"
                        value={value}
                        hideControls
                        onChange={(newValue) => {
                          onChange(newValue)
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
                  <YenBadge />
                </Flex>
                {isEditForm && (
                  <Controller
                    name={`variants.${index}.quantity`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="在庫"
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue)
                          setIsChanged?.(true)
                        }}
                        maw="none"
                        styles={{
                          label: {
                            fontWeight: 700
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Group>
            </Flex>
          )}
          {index === 2 && (
            <>
              <Box p="8" style={{ borderBottom: '1px solid #dee2e6' }}>
                <Controller
                  name="separateBackBelly"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Checkbox
                      label="背と腹を分ける"
                      checked={value}
                      onChange={(newValue) => {
                        onChange(newValue)
                        setIsChanged?.(true)
                      }}
                      disabled={isEditForm}
                    />
                  )}
                />
              </Box>
              <Flex
                h="100%"
                style={{
                  borderBottom: separateBackBelly ? '1px solid #dee2e6' : ''
                }}
              >
                <Box
                  bg="gray.1"
                  w={64}
                  style={{
                    borderRight: '1px solid #dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: '0'
                  }}
                >
                  <Box>
                    <Text
                      fw="700"
                      fz="sm"
                      mt="auto"
                      mb="auto"
                      style={{ display: 'inline' }}
                    >
                      1/4{separateBackBelly && '背'}
                    </Text>
                  </Box>
                </Box>
                <Group p="8" grow wrap="nowrap" gap="xs" w="100%">
                  <Flex align="flex-end" maw="none">
                    <Controller
                      name={`variants.${index}.price`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <NumberInput
                          label="単価"
                          placeholder="3500"
                          w="100%"
                          value={value}
                          hideControls
                          onChange={(newValue) => {
                            onChange(newValue)
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
                    <YenBadge />
                  </Flex>
                  <Flex align="flex-end" maw="none">
                    <Controller
                      name={`variants.${index}.discountedPrice`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <NumberInput
                          label="割引価格"
                          placeholder="3000"
                          w="100%"
                          value={value}
                          hideControls
                          onChange={(newValue) => {
                            onChange(newValue)
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
                    <YenBadge />
                  </Flex>
                  {isEditForm && (
                    <Controller
                      name={`variants.${index}.quantity`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <NumberInput
                          label="在庫"
                          value={value}
                          onChange={(newValue) => {
                            onChange(newValue)
                            setIsChanged?.(true)
                          }}
                          maw="none"
                          styles={{
                            label: {
                              fontWeight: 700
                            }
                          }}
                        />
                      )}
                    />
                  )}
                </Group>
              </Flex>
            </>
          )}
          {separateBackBelly && index === 3 && (
            <Flex h="100%">
              <Box
                bg="gray.1"
                w={64}
                style={{
                  borderRight: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0'
                }}
              >
                <Box>
                  <Text
                    fw="700"
                    fz="sm"
                    mt="auto"
                    mb="auto"
                    style={{ display: 'inline' }}
                  >
                    1/4腹
                  </Text>
                </Box>
              </Box>
              <Group p="8" grow wrap="nowrap" gap="xs" w="100%">
                <Flex align="flex-end" maw="none">
                  <Controller
                    name={`variants.${index}.price`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="単価"
                        placeholder="3500"
                        w="100%"
                        value={value}
                        hideControls
                        onChange={(newValue) => {
                          onChange(newValue)
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
                  <YenBadge />
                </Flex>
                <Flex align="flex-end" maw="none">
                  <Controller
                    name={`variants.${index}.discountedPrice`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="割引価格"
                        placeholder="3000"
                        w="100%"
                        hideControls
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue)
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
                  <YenBadge />
                </Flex>
                {isEditForm && (
                  <Controller
                    name={`variants.${index}.quantity`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <NumberInput
                        label="在庫"
                        value={value}
                        onChange={(newValue) => {
                          onChange(newValue)
                          setIsChanged?.(true)
                        }}
                        maw="none"
                        styles={{
                          label: {
                            fontWeight: 700
                          }
                        }}
                      />
                    )}
                  />
                )}
              </Group>
            </Flex>
          )}
        </Box>
      ))}
    </>
  )
}
