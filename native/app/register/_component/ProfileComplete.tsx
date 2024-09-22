import React from 'react'
import { useRouter } from 'expo-router'
import { Box, Button, Text, VStack, Heading } from 'native-base'

export default function ProfileComplete() {
  const router = useRouter()

  return (
    <VStack py="6">
      <VStack pb="8" px="4" space="4">
        <Heading fontSize="sm" color="text.900" textAlign="center">
          新規会員登録を受け付けました
        </Heading>
        <Text>
          アカウントが承認されるとアプリを使用いただけます。{'\n'}
          承認までもうしばらくお待ちください。
        </Text>
      </VStack>
      <Box px="4">
        <Button
          p="4"
          bg="darkBlue.900"
          borderRadius="4"
          onPress={() => {
            router.replace('/')
          }}
        >
          <Text color="text.50" fontSize="md" fontWeight="bold">
            ログイン画面に戻る
          </Text>
        </Button>
      </Box>
    </VStack>
  )
}
