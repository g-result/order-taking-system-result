import type React from 'react'
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
import type { EmailStep } from '..'
import { useEffect, useState } from 'react'
import { nativeApi } from '@/lib/trpc'

const schema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required')
})
type EmailFormData = z.infer<typeof schema>
type Props = {
  setStep: React.Dispatch<React.SetStateAction<EmailStep>>
}
export function EmailFormComponent({ setStep }: Props) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EmailFormData>({
    resolver: zodResolver(schema)
  })
  const [isLoading, setIsLoading] = useState(false)
  const changeEmail = nativeApi.user.changeEmail.useMutation()
  const currentEmail = nativeApi.user.mine.useQuery().data?.email
  useEffect(() => {
    if (currentEmail) {
      setValue('email', currentEmail)
    }
  }, [currentEmail])

  const onSubmit = async (data: EmailFormData) => {
    console.log('onSubmit', data)
    try {
      setIsLoading(true)
      await changeEmail.mutateAsync(data)
      setStep('success')
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack py="6" bg="coolGray.100" flexGrow={1}>
      <VStack>
        <Box pb="8">
          <VStack space="4">
            <VStack px="4" space="2">
              <Text color="text.900" fontSize="sm" fontWeight="bold">
                メールアドレス
              </Text>
              <Text color="text.500" fontSize="sm">
                メールアドレスを変更すると確認メールが送信されます。メール内のURLをクリックすると変更が完了します。
              </Text>
            </VStack>
            <Box py="6" px="4" bg="white">
              <VStack space="4">
                <Text fontSize="sm" color="text.500">
                  メールアドレス
                </Text>
                <FormControl isInvalid={!!errors.email}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
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
                    name="email"
                    defaultValue=""
                  />
                  <FormControl.ErrorMessage>
                    {errors.email?.message}
                  </FormControl.ErrorMessage>
                </FormControl>
              </VStack>
            </Box>
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
              'メールアドレスを変更する'
            )}
          </Button>
        </Box>
      </VStack>
    </VStack>
  )
}
