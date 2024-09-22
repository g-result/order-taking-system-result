import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from 'expo-router'
import {
  Box,
  Button,
  FormControl,
  Input,
  Text,
  VStack,
  HStack,
  StatusBar,
  Spinner,
  Toast
} from 'native-base'
import { supabase } from '@/lib/supabase'
import { AFTER_SIGNIN_PATH } from '@/const/config'
import { nativeApi } from '@/lib/trpc'
import { ORIGIN, isDev, isProd } from '@/util/env'
import { useAutoLogin } from '@/hooks/session'

const schema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください。')
    .min(1, 'メールアドレスは必須です。'),
  password: z.string().min(6, 'パスワードは必須です。')
})

type LoginFormData = z.infer<typeof schema>

export default function LoginScreen() {
  const userLoginMutation = nativeApi.user.userLogin.useMutation()
  useAutoLogin(userLoginMutation.mutateAsync)
  const [signInError, setSignInError] = useState('')
  const router = useRouter()
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: !isProd
      ? {
          email: 'admin@test.com',
          password: 'admintest'
        }
      : {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const onSignInSubmit = async (data: LoginFormData) => {
    console.log('onSignInSubmit', data)
    setIsLoading(true)
    const { email, password } = data
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error || !signInData) {
      console.log('error', error)
      setSignInError('ログインに失敗しました。再度やり直してください。')
      setIsLoading(false)
      return
    }
    const loginUser = await userLoginMutation.mutateAsync(
      signInData.user?.id as string
    )
    if (loginUser.approvalStatus !== 'APPROVED') {
      await supabase.auth.signOut()
      setIsLoading(false)
      Toast.show({
        title: '未承認です。',
        description: '管理者の承認が完了していません。',
        duration: 5000
      })
      return
    }
    setIsLoading(false)
    router.push(AFTER_SIGNIN_PATH)
  }

  const { error, data } = nativeApi.hello.useQuery()

  return (
    <Box flex={1}>
      <Box safeAreaTop>
        <StatusBar />
      </Box>
      <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
        <HStack alignItems="center" justifyContent="space-between" space="4">
          <Box h="16" w="16" />
          <Text fontSize="md" color="black" fontWeight="bold">
            ログイン
          </Text>
          <Box h="16" w="16" />
        </HStack>
      </Box>
      {isDev && (
        <Box>
          <Text>EXPO_PUBLIC_ENV:{process.env.EXPO_PUBLIC_ENV}</Text>
          <Text>ORIGIN:{ORIGIN}</Text>
          <Text>{error && 'Network error'}</Text>
        </Box>
      )}

      <VStack py="6" bg="coolGray.100" flexGrow={1}>
        <VStack px="4">
          <VStack pb="8">
            <VStack pb="6" space="4">
              <FormControl isInvalid={!!errors.email}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      bg="white"
                      size="md"
                      variant="outline"
                      placeholder="メールアドレス"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
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
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      bg="white"
                      size="md"
                      variant="outline"
                      placeholder="パスワード"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
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
            </VStack>
            {signInError && <Text color="error.500">{signInError}</Text>}
            <Button
              size="lg"
              bg="darkBlue.900"
              color="text.50"
              onPress={handleSubmit(onSignInSubmit)}
            >
              {isLoading ? <Spinner /> : 'ログイン'}
            </Button>
          </VStack>
          <VStack space="1">
            <HStack space="1" justifyContent="center">
              <Text color="text.900" fontSize="sm">
                パスワードを忘れた方は
              </Text>
              <Link href="/password-reset/">
                <Text color="info.500" textAlign="center" underline>
                  こちら
                </Text>
              </Link>
            </HStack>
            <HStack space="1" justifyContent="center">
              <Text color="text.900" fontSize="sm">
                会員登録がまだの方は
              </Text>
              <Link href="/register/">
                <Text color="info.500" textAlign="center" underline>
                  こちら
                </Text>
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  )
}
