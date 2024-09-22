'use client'

import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { TextInput, Button, Box, Title } from '@mantine/core'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { clientApi } from '~/lib/trpc/client-api'

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type FormData = z.infer<typeof schema>

export default function PasswordResetPage({
  params
}: { params: { token: string } }) {
  const { token } = params
  const [errorMessage, setErrorMessage] = useState('')
  const resetPassword = clientApi.user.resetPassword.useMutation()
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit: SubmitHandler<FormData> = async ({
    password,
    confirmPassword
  }) => {
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません。')
      return
    }
    try {
      await resetPassword.mutateAsync({
        passwordResetToken: token,
        password
      })
      setIsSuccess(true)
    } catch (error) {
      setErrorMessage('パスワード変更に失敗しました。')
    }
  }
  if (isSuccess)
    return (
      <Box>
        パスワードを変更しました。新しいパスワードを使ってログイン画面からログインしてください。
      </Box>
    )
  return (
    <Box maw={400} mx="auto" mt={50}>
      <Title mb={30}>パスワードリセット</Title>
      {errorMessage && (
        <Box color="red" mb={20}>
          {errorMessage}
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="New Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          mb={20}
        />
        <TextInput
          label="Confirm Password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          mb={20}
        />
        <Button type="submit" fullWidth mt="md">
          パスワードを変更する
        </Button>
      </form>
    </Box>
  )
}
