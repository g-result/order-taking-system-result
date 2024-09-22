import type React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'expo-router'
import {
  Box,
  Button,
  FormControl,
  Input,
  Text,
  VStack,
  HStack,
  Center,
  Spinner
} from 'native-base'
import type { PasswordResetStep } from '..'
import { supabase } from '@/lib/supabase'
import { generateID } from '@/util'
import { nativeApi } from '@/lib/trpc'
import { useState } from 'react'

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required')
})

type ResetPasswordFormData = z.infer<typeof schema>
type Props = {
  setStep: React.Dispatch<React.SetStateAction<PasswordResetStep>>
}
export default function EmailSubmit({ setStep }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema)
  })
  const createPasswordResetToken =
    nativeApi.user.createPasswordResetToken.useMutation()
  const onSubmit = async ({ email }: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      const passwordResetToken = generateID()
      await createPasswordResetToken.mutateAsync({
        email,
        passwordResetToken
      })
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_ORIGIN}/password-reset/${passwordResetToken}`
      })
      if (error) {
        console.error('Error sending reset password email:', error.message)
        alert(
          'パスワード再設定メールの送信に失敗しました。もう一度お試しください。'
        )
        setIsLoading(false)
        return
      }
      setStep('sended')
    } catch (error) {
      alert(
        'パスワード再設定メールの送信に失敗しました。もう一度お試しください。'
      )
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  return (
    <VStack py="6" bg="coolGray.100" flexGrow={1}>
      <VStack px="4">
        <VStack pb="8">
          <Box pb="4">
            <Text color="text.500" fontSize="md">
              登録しているメールアドレスを入力してください。パスワード再設定のためのメールを送信します。
            </Text>
          </Box>
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
          </VStack>
          <Button
            size="lg"
            bg="darkBlue.900"
            color="text.50"
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Center>
                <Spinner color="white" />
              </Center>
            ) : (
              'メールを送信する'
            )}
          </Button>
        </VStack>
        <VStack space="1">
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
        </VStack>
      </VStack>
    </VStack>
  )
}
