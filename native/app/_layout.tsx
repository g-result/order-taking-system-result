import { Slot } from 'expo-router'
import { Box, NativeBaseProvider, View } from 'native-base'
import { NativeTRPCProvider } from '@/lib/trpc'
import { useSession } from '@/hooks/session'

export default function AppLayout() {
  useSession()
  return (
    <NativeTRPCProvider>
      <NativeBaseProvider>
        <Box flex={1} bgColor="white">
          <Slot />
        </Box>
      </NativeBaseProvider>
    </NativeTRPCProvider>
  )
}
