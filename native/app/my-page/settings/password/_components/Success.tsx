import React from 'react'
import { Box, Text, VStack, Heading } from 'native-base'

export default function SuccessComponent() {
  return (
    <VStack py="6" bg="coolGray.100" flexGrow={1}>
      <Box pb="8">
        <VStack space="4">
          <VStack px="4" space="2">
            <Heading color="text.900" fontSize="sm" textAlign="center">
              パスワードの変更が完了しました
            </Heading>
            <Text color="text.500" fontSize="sm">
              パスワードの変更が完了しました。引き続きアプリをご利用ください
            </Text>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  )
}
