// ProductPricing.tsx
import {
  Box,
  Flex,
  Text,
  Group,
  TextInput,
  Badge,
  NumberInput,
  ActionIcon,
  CloseIcon,
  Button
} from '@mantine/core'
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors
} from 'react-hook-form'
import type { ProductUnitType } from '@prisma/client'
import { IconPlus } from '@tabler/icons-react'
import { YenBadge } from './YenBadge'
import type { ProductFormValues } from './EditForm'
import { modals } from '@mantine/modals'

type ProductPricingProps = {
  control: Control<ProductFormValues>
  errors: FieldErrors<ProductFormValues>
  isDisabled?: boolean
  isEditForm?: boolean
  setIsChanged?: (isChanged: boolean) => void
}

const defaultData = {
  salesFormat: '',
  unitType: 'WHOLE' as ProductUnitType,
  price: 0,
  tax: 10,
  discountedPrice: 0,
  quantity: 0
}

export const ProductPricingOther = ({
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

  // 削除確認モーダルを表示する関数を追加
  const handleRemove = (index: number) => {
    modals.openConfirmModal({
      title: '確認',
      centered: true,
      children: <Text size="sm">単価・売り方を消去してもよろしいですか？</Text>,
      labels: { confirm: 'はい', cancel: 'いいえ' },
      onCancel: () => {},
      onConfirm: () => {
        remove(index)
        setIsChanged?.(true)
      }
    })
  }

  return (
    <>
      {fields.map((field, index) => (
        <Box
          key={field.id}
          style={{ border: '1px solid #dee2e6', borderRadius: 4 }}
          mt="4"
        >
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
                  {index + 1}
                </Text>
                <Text c="red" style={{ display: 'inline' }}>
                  {' '}
                  {index === 0 && '*'}
                </Text>
              </Box>
            </Box>
            <Group p="8" grow wrap="nowrap" w="100%">
              <Controller
                name={`variants.${index}.salesFormat`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    label="売り方"
                    value={value}
                    onChange={(e) => {
                      onChange(e)
                      setIsChanged?.(true)
                    }}
                    error={errors?.variants?.[index]?.salesFormat?.message}
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
                      onChange={(e) => {
                        onChange(e)
                        setIsChanged?.(true)
                      }}
                      hideControls
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
                      onChange={(e) => {
                        onChange(e)
                        setIsChanged?.(true)
                      }}
                      hideControls
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
                    onChange={(e) => {
                      onChange(e)
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
              {index !== 0 && (
                <Box>
                  <ActionIcon
                    variant="filled"
                    size="sm"
                    disabled={isEditForm}
                    onClick={() => handleRemove(index)}
                  >
                    <CloseIcon size="16" />
                  </ActionIcon>
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      ))}
      <Flex justify="center" mt="8">
        <Button
          leftSection={<IconPlus size={16} stroke={2} />}
          disabled={isEditForm}
          onClick={() => {
            append(defaultData)
            setIsChanged?.(true)
          }}
        >
          売り方を追加する
        </Button>
      </Flex>
    </>
  )
}
