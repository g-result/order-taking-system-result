import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Text,
  VStack,
  FormControl,
  Input,
  Button,
  useToast
} from 'native-base'

const schema = z.object({
  shopName: z.string().min(1, '店舗名は必須です'),
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません')
    .min(1, 'メールアドレスは必須です'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  name: z.string().min(1, '名前は必須です'),
  phoneNumber: z.string().min(1, '電話番号は必須です'),
  payeeName: z.string().min(1, '振込先名義は必須です')
})

type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const toast = useToast()
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopName: '',
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
      payeeName: ''
    }
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    // 設定の更新処理を実装
    toast.show({
      description: '設定を更新しました'
    })
  }

  return (
    <Box flex={1} p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        設定
      </Text>
      <VStack space={4}>
        <FormControl isInvalid={!!errors.shopName}>
          <FormControl.Label>店舗名</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="shopName"
          />
          <FormControl.ErrorMessage>
            {errors.shopName?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormControl.Label>メールアドレス</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="email"
          />
          <FormControl.ErrorMessage>
            {errors.email?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormControl.Label>パスワード</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                type="password"
              />
            )}
            name="password"
          />
          <FormControl.ErrorMessage>
            {errors.password?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.name}>
          <FormControl.Label>名前</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="name"
          />
          <FormControl.ErrorMessage>
            {errors.name?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phoneNumber}>
          <FormControl.Label>電話番号</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="phoneNumber"
          />
          <FormControl.ErrorMessage>
            {errors.phoneNumber?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.payeeName}>
          <FormControl.Label>振込先名義</FormControl.Label>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} />
            )}
            name="payeeName"
          />
          <FormControl.ErrorMessage>
            {errors.payeeName?.message}
          </FormControl.ErrorMessage>
        </FormControl>

        <Button onPress={handleSubmit(onSubmit)}>更新</Button>
      </VStack>
    </Box>
  )
}
