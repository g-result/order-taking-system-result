import { Box, Text, Icon, Button, HStack, Badge, VStack } from 'native-base'
import { useRouter } from 'expo-router'
import {
  IconHome,
  IconShoppingCart,
  IconUser
} from '@tabler/icons-react-native'
import { nativeApi } from '@/lib/trpc'

export default function BottomNavigation() {
  const router = useRouter()
  const { data } = nativeApi.cart.findByUser.useQuery()
  const cartCount = data?.items.length ?? 0
  return (
    <Box>
      <HStack alignItems="center" safeAreaBottom px="4" bg="white">
        <Button
          flex={1}
          onPress={() => router.replace('/products/')}
          variant="unstyled"
          py="2"
          px="1.5"
        >
          <VStack alignItems="center">
            <Icon as={<IconHome size="18" />} color="muted.800" />
            <Text color="muted.800" fontSize="2xs">
              ホーム
            </Text>
          </VStack>
        </Button>
        <Button
          flex={1}
          onPress={() => router.replace('/cart/')}
          variant="unstyled"
          py="2"
          px="1.5"
        >
          <VStack alignItems="center">
            <Box position="relative">
              {cartCount > 0 && (
                <Badge
                  zIndex={1}
                  bg="error.500"
                  rounded="full"
                  variant="solid"
                  position="absolute"
                  width="16px"
                  height="16px"
                  display="flex"
                  p="0"
                  top="-6"
                  left="2"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth="2px"
                  borderColor="white"
                >
                  <Text
                    fontSize="8px"
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                  >
                    {cartCount}
                  </Text>
                </Badge>
              )}
              <Icon as={<IconShoppingCart size="18" />} color="muted.800" />
            </Box>
            <Text color="muted.800" fontSize="2xs">
              カート
            </Text>
          </VStack>
        </Button>
        <Button
          flex={1}
          onPress={() => router.replace('/my-page/')}
          variant="unstyled"
          py="2"
          px="1.5"
          opacity="0.4"
        >
          <VStack alignItems="center">
            <Icon as={<IconUser size="18" />} color="muted.800" />
            <Text color="muted.800" fontSize="2xs">
              マイページ
            </Text>
          </VStack>
        </Button>
      </HStack>
    </Box>
  )
}
