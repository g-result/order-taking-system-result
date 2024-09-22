import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Box, FlatList } from 'native-base'
import ProfileForm from '@/components/ProfileForm'
import type { RegisterFormStatus } from '@/app/register'
import { Header } from '@/components/Header'
import { nativeApi } from '@/lib/trpc'

export default function RegisterScreen() {
  const [registerFormStatus, setRegisterFormStatus] =
    useState<RegisterFormStatus>('input')
  const router = useRouter()
  const user = nativeApi.user.mine.useQuery().data

  const renderItem = () => (
    <Box bg="coolGray.100">
      <Header
        title={'会員情報変更'}
        onPressBack={() => router.replace('/my-page/')}
      />
      {user && (
        <ProfileForm
          setRegisterFormStatus={setRegisterFormStatus}
          user={user}
        />
      )}
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
