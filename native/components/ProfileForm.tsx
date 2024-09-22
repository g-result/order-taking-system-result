import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, Link } from 'expo-router'
import {
  Box,
  Button,
  FormControl,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Checkbox,
  Center,
  Spinner,
  Toast
} from 'native-base'
import { LOCATION_LIST } from '@/const/location_list'
import { supabase } from '@/lib/supabase'
import { nativeApi } from '@/lib/trpc'
import type { RegisterFormStatus } from '@/app/register'
import { isDev } from '@/util/env'

const katakanaRegex = /^[ァ-ヶー]+$/
const registerSchema = z
  .object({
    email: z
      .string()
      .email('有効なメールアドレスを入力してください。')
      .min(1, 'メールアドレスは必須です。'),
    password: z.string().min(6, 'パスワードは6文字以上である必要があります。'),
    confirmPassword: z
      .string()
      .min(6, 'パスワードは6文字以上である必要があります。'),
    companyName: z.string().optional(),
    shopName: z.string().min(1, '店舗名は必須です。'),
    phoneNumber: z
      .string()
      .min(1, '電話番号は必須です。')
      .regex(/^\d+$/, '電話番号は半角数字で入力してください。'),
    businessType: z.string().optional(),
    zipCodePart1: z.string().optional(),
    zipCodePart2: z.string().optional(),
    prefecture: z.string().optional(),
    city: z.string().optional(),
    addressLine: z.string().optional(),
    name: z.string().min(1, '名前は必須です。'),
    nameKana: z
      .string()
      .min(1, '名前（カナ）は必須です。')
      .regex(katakanaRegex, '名前（カナ）はカタカナで入力してください。'),
    transferName: z.string().min(1, '振込名義は必須です。'),
    transferNameKana: z
      .string()
      .min(1, '振込名義（カナ）は必須です。')
      .regex(katakanaRegex, '振込名義（カナ）はカタカナで入力してください。')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードと確認用パスワードが一致しません。',
    path: ['confirmPassword']
  })
const updateSchema = z.object({
  companyName: z.string().optional(),
  shopName: z.string().min(1, '店舗名は必須です。'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です。')
    .regex(/^\d+$/, '電話番号は半角数字で入力してください。'),
  businessType: z.string().optional(),
  zipCodePart1: z.string().optional(),
  zipCodePart2: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  addressLine: z.string().optional(),
  name: z.string().min(1, '名前は必須です。'),
  nameKana: z
    .string()
    .min(1, '名前（カナ）は必須です。')
    .regex(katakanaRegex, '名前（カナ）はカタカナで入力してください。'),
  transferName: z.string().min(1, '振込名義は必須です。'),
  transferNameKana: z
    .string()
    .min(1, '振込名義（カナ）は必須です。')
    .regex(katakanaRegex, '振込名義（カナ）はカタカナで入力してください。')
})

type RegisterFormData = z.infer<typeof registerSchema>
type UpdateFormData = z.infer<typeof updateSchema>
type Prop = {
  setRegisterFormStatus: (status: RegisterFormStatus) => void
  user?: { id: string; name: string } | undefined
}

export default function ProfileForm({ setRegisterFormStatus, user }: Prop) {
  const createUser = nativeApi.user.register.useMutation()
  const updateUser = nativeApi.user.update.useMutation()
  const [isAgreed, setIsAgreed] = useState(!!user)
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(user ? updateSchema : registerSchema),
    defaultValues: user
      ? { ...user }
      : isDev
        ? {
            email: 'user@test.com',
            password: 'usertest',
            confirmPassword: 'usertest',
            companyName: 'companyName',
            shopName: 'shopName',
            phoneNumber: '09012345678',
            businessType: 'businessType',
            zipCodePart1: '123',
            zipCodePart2: '4567',
            prefecture: '北海道',
            city: 'city',
            addressLine: 'addressLine',
            name: 'name',
            nameKana: 'カナ',
            transferName: 'transferName',
            transferNameKana: 'カナ'
          }
        : {}
  })
  // console.log({ user, errors })

  const onSubmit = (data: RegisterFormData) =>
    user ? handleUpdateUser(data) : handleCreateUser(data)

  const handleUpdateUser = async ({
    companyName,
    shopName,
    phoneNumber,
    businessType,
    zipCodePart1,
    zipCodePart2,
    prefecture,
    city,
    addressLine,
    name,
    nameKana,
    transferName,
    transferNameKana
  }: RegisterFormData) => {
    setIsLoading(true)
    try {
      await updateUser.mutateAsync({
        companyName,
        shopName,
        phoneNumber,
        businessType,
        postalCode: `${zipCodePart1}${zipCodePart2}`,
        prefecture,
        city,
        addressLine,
        name,
        nameKana,
        transferName,
        transferNameKana
      })
      Toast.show({
        title: '更新しました'
      })
    } catch (error) {
      Toast.show({
        title: '更新に失敗しました'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async ({
    email,
    password,
    confirmPassword,
    companyName,
    shopName,
    phoneNumber,
    businessType,
    zipCodePart1,
    zipCodePart2,
    prefecture,
    city,
    addressLine,
    name,
    nameKana,
    transferName,
    transferNameKana
  }: RegisterFormData) => {
    setIsLoading(true)
    const inputUser = {
      email,
      companyName,
      shopName,
      phoneNumber,
      businessType,
      postalCode: `${zipCodePart1}${zipCodePart2}`,
      prefecture,
      city,
      addressLine,
      name,
      nameKana,
      transferName,
      transferNameKana
    }
    if (password !== confirmPassword) {
      alert('パスワードと確認用パスワードが一致しません。')
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          isStatus: false
        }
      }
    })
    if (error) {
      console.error('サインアップエラー:', error)
      alert('アカウント作成中にエラーが発生しました。')
      setIsLoading(false)
      return
    }
    console.log('signup完了:', data)
    setIsLoading(false)

    if (data.user) {
      try {
        await createUser.mutateAsync({ ...inputUser, id: data.user.id })
        alert('アカウントが作成されました。認証メールが送信されました。')
      } catch (error) {
        console.error('データベースエラー:', error)
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          console.error('サインアウトエラー:', signOutError.message)
        } else {
          console.log(
            'ユーザーはアカウントを作成しましたが、データベースへの追加に失敗しました。アカウントが削除されました。'
          )
        }
      }
    } else {
      console.error('サインアップ後にユーザーデータが見つかりません。')
      alert('アカウント作成中にエラーが発生しました。')
    }
    setRegisterFormStatus('complete')
  }

  return (
    <VStack py="6">
      <VStack pb="6">
        <VStack space="8" pb="8">
          {!user && (
            <VStack space="4">
              <Text fontSize="md" color="text.900" fontWeight="bold" px="4">
                ログイン情報
              </Text>
              <VStack py="6" px="4" space="6" bg="white">
                <FormControl isInvalid={!!errors.email}>
                  <FormControl.Label>
                    メールアドレス{<Text style={{ color: 'red' }}>*</Text>}
                  </FormControl.Label>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="例) email@example.com"
                      />
                    )}
                    name="email"
                    defaultValue=""
                  />
                  <FormControl.ErrorMessage>
                    {errors.email?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                  <FormControl.Label>
                    パスワード{<Text style={{ color: 'red' }}>*</Text>}
                  </FormControl.Label>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        type="password"
                      />
                    )}
                    name="password"
                    defaultValue=""
                  />
                  <FormControl.ErrorMessage>
                    {errors.password?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormControl.Label>
                    パスワード（確認）{<Text style={{ color: 'red' }}>*</Text>}
                  </FormControl.Label>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        type="password"
                      />
                    )}
                    name="confirmPassword"
                    defaultValue=""
                  />
                  <FormControl.ErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
              </VStack>
            </VStack>
          )}
          <VStack space="4">
            <Text fontSize="md" color="text.900" fontWeight="bold" px="4">
              店舗情報
            </Text>
            <VStack py="6" px="4" space="6" bg="white">
              <FormControl>
                <FormControl.Label color="red.500">
                  ご請求先会社名
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) 株式会社山一水産"
                    />
                  )}
                  name="companyName"
                  defaultValue=""
                />
              </FormControl>
              <FormControl isInvalid={!!errors.shopName}>
                <FormControl.Label>
                  店舗名{<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) 株式会社山一水産天橋立店"
                    />
                  )}
                  name="shopName"
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.shopName?.message}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.phoneNumber}>
                <FormControl.Label>
                  店舗電話番号{<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例)09012345678"
                    />
                  )}
                  name="phoneNumber"
                  defaultValue=""
                />
                <Text color="text.500">ハイフンなしで記入してください</Text>
                <FormControl.ErrorMessage>
                  {errors.phoneNumber?.message}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl>
                <FormControl.Label>該当の業界</FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例)水産業"
                    />
                  )}
                  name="businessType"
                  defaultValue=""
                />
              </FormControl>
            </VStack>
          </VStack>
          <VStack space="4">
            <Text fontSize="md" color="text.900" fontWeight="bold" px="4">
              店舗住所
            </Text>
            <VStack py="6" px="4" space="6" bg="white">
              <FormControl>
                <FormControl.Label>郵便番号</FormControl.Label>
                <HStack space={2} alignItems="center">
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        maxLength={3}
                        width="15%"
                        size="md"
                      />
                    )}
                    name="zipCodePart1"
                    defaultValue=""
                  />
                  <Text>-</Text>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="numeric"
                        maxLength={4}
                        width="17%"
                        size="md"
                      />
                    )}
                    name="zipCodePart2"
                    defaultValue=""
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormControl.Label>都道府県</FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Select
                      selectedValue={value}
                      onValueChange={onChange}
                      placeholder="選択してください"
                    >
                      {LOCATION_LIST.map((item) => (
                        <Select.Item
                          label={item.label}
                          value={item.value}
                          key={item.label}
                        />
                      ))}
                    </Select>
                  )}
                  name="prefecture"
                  defaultValue=""
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>市区町村</FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) 渋谷区"
                    />
                  )}
                  name="city"
                  defaultValue=""
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>その先住所</FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="町・丁目・番地・建物・アパート番号等"
                    />
                  )}
                  name="addressLine"
                  defaultValue=""
                />
              </FormControl>
            </VStack>
          </VStack>
          <VStack space="4">
            <Text fontSize="md" color="text.900" fontWeight="bold" px="4">
              担当者情報
            </Text>
            <VStack py="6" px="4" space="6" bg="white">
              <FormControl isInvalid={!!errors.name}>
                <FormControl.Label>
                  名前{<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) 山田太郎"
                    />
                  )}
                  name="name"
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.name?.message}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.nameKana}>
                <FormControl.Label>
                  名前（カタカナ）{<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) ヤマダタロウ"
                    />
                  )}
                  name="nameKana"
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.nameKana?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>
          </VStack>
          <VStack space="4">
            <Text fontSize="md" color="text.900" fontWeight="bold" px="4">
              振り込み情報
            </Text>
            <VStack py="6" px="4" space="6" bg="white">
              <FormControl isInvalid={!!errors.transferName}>
                <FormControl.Label>
                  振り込み名義{<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) 山田太郎"
                    />
                  )}
                  name="transferName"
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.transferName?.message}
                </FormControl.ErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.nameKana}>
                <FormControl.Label>
                  振り込み名義（カタカナ）
                  {<Text style={{ color: 'red' }}>*</Text>}
                </FormControl.Label>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      placeholder="例) ヤマダタロウ"
                    />
                  )}
                  name="transferNameKana"
                  defaultValue=""
                />
                <FormControl.ErrorMessage>
                  {errors.transferNameKana?.message}
                </FormControl.ErrorMessage>
              </FormControl>
            </VStack>
            {!user && (
              <Box pl="4">
                <Checkbox
                  value="agreed"
                  isChecked={isAgreed}
                  onChange={(isChecked) => setIsAgreed(isChecked)}
                >
                  利用規約に同意する
                </Checkbox>
              </Box>
            )}
          </VStack>
          <Box px="4">
            <Button
              p="4"
              bg="darkBlue.900"
              borderRadius="4"
              onPress={handleSubmit(onSubmit)}
              isDisabled={!isAgreed}
            >
              <Text color="text.50" fontSize="md" fontWeight="bold">
                {isLoading ? (
                  <Center>
                    <Spinner color="white" />
                  </Center>
                ) : user ? (
                  '変更する'
                ) : (
                  '会員登録を完了する'
                )}
              </Text>
            </Button>
          </Box>
        </VStack>
        {!user && (
          <HStack space="1" justifyContent="center">
            <Text color="text.900" fontSize="sm">
              ログイン画面は
            </Text>
            <Link href="/">
              <Text color="info.500" textAlign="center" underline>
                こちら
              </Text>
            </Link>
          </HStack>
        )}
      </VStack>
    </VStack>
  )
}
