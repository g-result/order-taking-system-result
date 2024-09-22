import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Center,
  FormControl,
  Input,
  Spinner,
  Text,
  VStack
} from 'native-base'
import type { PasswordUpdateStep } from '..'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
})

type ResetPasswordFormData = z.infer<typeof schema>
type Props = {
  setStep: (status: PasswordUpdateStep) => void
}
export default function PasswordForm({ setStep }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema)
  })
  const [isLoading, setIsLoading] = useState(false)
  const onSubmit = async ({
    password,
    newPassword,
    confirmNewPassword
  }: ResetPasswordFormData) => {
    if (newPassword !== confirmNewPassword)
      return alert('新しいパスワードが一致しません')
    setIsLoading(true)

    const session = await supabase.auth.getSession()
    if (!session) {
      alert('ログインしていません')
      setIsLoading(false)
      return
    }
    const email = session.data.session?.user.email ?? ''
    const { error: signinError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (signinError) {
      alert('パスワードが違います')
      console.log('signinError', signinError)
      setIsLoading(false)
      return
    }

    const { data: userData, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    console.log('updateUser', { userData, error })
    if (error) {
      alert('パスワードの変更に失敗しました')
      console.error(error)
      setIsLoading(false)
      return
    }
    setStep('success')
    setIsLoading(false)
  }

  return (
    <VStack py="6" bg="coolGray.100" flexGrow={1}>
      <VStack>
        <Box pb="8">
          <VStack space="4">
            <Box px="4">
              <Text color="text.900" fontSize="sm" fontWeight="bold">
                パスワード
              </Text>
            </Box>
            <VStack py="6" px="4" space="6" bg="white">
              <VStack space="4">
                <Text fontSize="sm" color="text.500">
                  現在のパスワード{<Text style={{ color: 'red' }}>*</Text>}
                </Text>
                <FormControl isInvalid={!!errors.password}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        type="password"
                        bg="white"
                        size="md"
                        variant="outline"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
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
              <VStack space="4">
                <Text fontSize="sm" color="text.500">
                  新しいパスワード{<Text style={{ color: 'red' }}>*</Text>}
                </Text>
                <FormControl isInvalid={!!errors.newPassword}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        type="password"
                        bg="white"
                        size="md"
                        variant="outline"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    )}
                    name="newPassword"
                    defaultValue=""
                  />
                  <FormControl.ErrorMessage>
                    {errors.newPassword?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
              </VStack>
              <VStack space="4">
                <Text fontSize="sm" color="text.500">
                  新しいパスワード（確認）
                  {<Text style={{ color: 'red' }}>*</Text>}
                </Text>
                <FormControl isInvalid={!!errors.confirmNewPassword}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        type="password"
                        bg="white"
                        size="md"
                        variant="outline"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    )}
                    name="confirmNewPassword"
                    defaultValue=""
                  />
                  <FormControl.HelperText>
                    確認のため新しいパスワードをもう一度入力してください
                  </FormControl.HelperText>
                  <FormControl.ErrorMessage>
                    {errors.confirmNewPassword?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
              </VStack>
            </VStack>
          </VStack>
        </Box>
        <Box px="4">
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
              '変更する'
            )}
          </Button>
        </Box>
      </VStack>
    </VStack>
  )
}
