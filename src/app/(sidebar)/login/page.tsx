'use client'
import { useState, useEffect } from 'react'
import { useForm, zodResolver } from '@mantine/form'
import { TextInput, PasswordInput, Button, Card, Checkbox } from '@mantine/core'
import { z } from 'zod'
import { useSupabaseAuth } from '@/hooks/supabaseAuth'
import './login.css'
import { clientApi } from '~/lib/trpc/client-api'

const schema = z.object({
  email: z
    .string()
    .email({ message: '正しいメールアドレスの形式で入力してください' })
    .min(2, { message: 'メールアドレスは必須です。' }),
  password: z
    .string()
    .min(4, { message: 'パスワードは6文字以上である必要があります。' })
})

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false)
  const [rememberedInput, setRememberedInput] = useState<{
    email: string
    password: string
  } | null>(null)
  const { adminSignin } = useSupabaseAuth()

  const getRememberedInput = () => {
    const rememberedInput = localStorage.getItem('rememberedInput')
    return rememberedInput ? JSON.parse(rememberedInput) : null
  }

  const saveRememberedInput = ({
    email,
    password,
    isRemember
  }: { email: string; password: string; isRemember: boolean }) => {
    localStorage.setItem(
      'rememberedInput',
      JSON.stringify({ email, password, isRemember })
    )
  }

  const adminLoginMutation = clientApi.user.adminLogin.useMutation()

  const deleteRememberedInput = () => {
    localStorage.removeItem('rememberedInput')
  }

  useEffect(() => {
    const input = getRememberedInput()
    if (input) {
      setRememberedInput({ email: input.email, password: input.password })
      setRememberMe(input.isRemember)
    }
  }, [])

  useEffect(() => {
    form.setValues(rememberedInput || { email: '', password: '' })
  }, [rememberedInput])

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: rememberedInput || {
      email: '',
      password: ''
    }
  })

  const handleSubmit = async (values: typeof form.values) => {
    if (rememberMe) {
      saveRememberedInput({ ...values, isRemember: rememberMe })
    } else {
      deleteRememberedInput()
    }

    await adminSignin(values, adminLoginMutation.mutateAsync)
  }

  return (
    <Card mx="auto" shadow="md" px="lg" pt="30" pb="40" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="メールアドレス"
          placeholder="you@mantine.dev"
          {...form.getInputProps('email')}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
        <PasswordInput
          label="パスワード"
          placeholder="パスワード"
          mt="md"
          {...form.getInputProps('password')}
          styles={{
            label: {
              fontWeight: 700
            }
          }}
        />
        <Checkbox
          label="次回から入力を省略"
          mt="xl"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
        <Button type="submit" fullWidth mt="xl">
          ログイン
        </Button>
      </form>
    </Card>
  )
}
