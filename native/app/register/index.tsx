import React, { useState } from 'react'
import { Box, Text, HStack, FlatList, StatusBar } from 'native-base'
import ProfileForm from '@/components/ProfileForm'
import ProfileComplete from './_component/ProfileComplete'

export type RegisterFormStatus = 'input' | 'complete'
export default function RegisterScreen() {
  const [registerFormStatus, setRegisterFormStatus] =
    useState<RegisterFormStatus>('input')

  const renderItem = () => (
    <Box bg="coolGray.100">
      <Box safeAreaTop bg="white">
        <StatusBar />
      </Box>
      <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
        <HStack alignItems="center" justifyContent="space-between" space="4">
          <Box h="16" w="16" />
          <Text fontSize="md" color="black" fontWeight="bold">
            新規会員登録
          </Text>
          <Box h="16" w="16" />
        </HStack>
      </Box>
      {registerFormStatus === 'input' && (
        <ProfileForm setRegisterFormStatus={setRegisterFormStatus} />
      )}
      {registerFormStatus === 'complete' && <ProfileComplete />}
    </Box>
  )

  return (
    <FlatList
      data={[{ key: 'form' }]}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
    />
  )
}
