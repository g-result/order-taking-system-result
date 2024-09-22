import { Box, Button, Text, VStack } from 'native-base'
import type { PasswordResetStep } from '..'
import { useRouter } from 'expo-router'

type Props = {
  setStep: React.Dispatch<React.SetStateAction<PasswordResetStep>>
}

export default function EmailComplete({ setStep }: Props) {
  const router = useRouter()
  return (
    <VStack py="6" bg="coolGray.100" flexGrow={1}>
      <VStack px="4">
        <VStack pb="8">
          <Box pb="4">
            <Text color="text.500" fontSize="md">
              入力されたメールアドレスにパスワード再設定のためのメールを送信しました。
              {'\n'}
              メールをご確認の上、パスワードの再設定を行なってください。
            </Text>
          </Box>
          <Button
            size="lg"
            bg="darkBlue.900"
            color="text.50"
            onPress={() => {
              router.replace('/')
            }}
          >
            ログイン画面に戻る
          </Button>
        </VStack>
      </VStack>
    </VStack>
  )
}
