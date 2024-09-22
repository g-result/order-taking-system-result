import { useRouter } from 'expo-router'
import { Box, Text, HStack, Switch } from 'native-base'
import BottomNavigation from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { nativeApi } from '@/lib/trpc'
import type { SwitchChangeEvent } from 'react-native'
import { requestPermissionsAsync } from 'expo-notifications'
import { PushTest } from '@/components/PushTest'
import { isProd } from '@/util/env'
import { useEffect, useState } from 'react'

export default function AccountDeleteScreen() {
  const router = useRouter()
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  const updateUser = nativeApi.user.updatePushNotificationEnabled.useMutation()
  const fetchUserSettings = nativeApi.user.getUserSettings.useQuery()

  useEffect(() => {
    if (fetchUserSettings.data) {
      setIsPushEnabled(fetchUserSettings.data.pushNotificationEnabled)
    }
  }, [fetchUserSettings.data])

  const onChange = async (e: SwitchChangeEvent) => {
    const pushNotificationEnabled = e.nativeEvent.value
    setIsPushEnabled(pushNotificationEnabled)
    await updateUser.mutateAsync(pushNotificationEnabled)
    if (pushNotificationEnabled) requestPermissionsAsync()
  }

  return (
    <Box flex={1}>
      <Header
        title={'プッシュ通知設定'}
        onPressBack={() => router.replace('/my-page/')}
      />

      <Box py="6" bg="coolGray.100" flexGrow={1}>
        <HStack
          px="4"
          py="6"
          bg="white"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text color="text.900" fontSize="sm">
            お知らせ通知
          </Text>
          <Switch
            size="sm"
            onTrackColor="info.500"
            onChange={onChange}
            isChecked={isPushEnabled}
          />
        </HStack>
      </Box>

      {!isProd && <PushTest />}

      <BottomNavigation />
    </Box>
  )
}
