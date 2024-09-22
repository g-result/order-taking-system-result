import { useRouter } from 'expo-router'
import { Box, Text } from 'native-base'
import BottomNavigation from '@/components/BottomNavigation'
import { Header } from '@/components/Header'

export default function AccountDeleteScreen() {
  const router = useRouter()
  return (
    <Box flex={1}>
      <Header
        title={'アカウント削除'}
        onPressBack={() => router.replace('/my-page/')}
      />

      <Box py="6" bg="coolGray.100" flexGrow={1}>
        <Box px="4">
          <Text color="text.500" fontSize="sm">
            アカウントの削除を希望する場合は直接運営者までお問い合わせください。
          </Text>
        </Box>
      </Box>
      <BottomNavigation />
    </Box>
  )
}
