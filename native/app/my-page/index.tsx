import { useState } from 'react'
import {
  Box,
  Text,
  Icon,
  StatusBar,
  ScrollView,
  Pressable,
  HStack,
  VStack
} from 'native-base'
import { IconChevronRight } from '@tabler/icons-react-native'
import BottomNavigation from '@/components/BottomNavigation'
import { useRouter } from 'expo-router'
import LogoutModal from '@/components/LogoutModal'

export default function MyPageScreen() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const MENU: {
    [key: string]: {
      title: string
      onPress: () => void
    }[]
  } = {
    注文履歴一覧: [
      {
        title: '注文履歴',
        onPress: () => router.push('/my-page/order-history/')
      }
    ],
    会員登録情報: [
      {
        title: '会員情報変更',
        onPress: () => router.push('/my-page/settings/profile/')
      },
      {
        title: 'メールアドレス変更',
        onPress: () => router.push('/my-page/settings/email/')
      },
      {
        title: 'パスワード変更',
        onPress: () => router.push('/my-page/settings/password/')
      }
    ],
    アカウント: [
      {
        title: 'ログアウト',
        onPress: () => setShowLogoutModal(true)
      },
      {
        title: 'アカウント削除',
        onPress: () => router.push('/my-page/settings/account/')
      }
    ],
    アプリ設定: [
      {
        title: 'プッシュ通知',
        onPress: () => router.push('/my-page/settings/push/')
      },
      {
        title: '利用規約',
        onPress: () => router.push('/my-page/terms-of-service/')
      },
      {
        title: 'プライバシーポリシー',
        onPress: () => router.push('/my-page/privacy-policy/')
      },
      {
        title: '丸魚体請求などの注意事項',
        onPress: () => router.push('/my-page/notes/')
      }
    ]
  }
  return (
    <>
      <ScrollView bg="coolGray.100">
        <Box safeAreaTop bg="white">
          <StatusBar />
        </Box>
        <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
          <HStack alignItems="center" justifyContent="space-between" space="4">
            <Box h="16" w="16" />
            <Text fontSize="md" color="black" fontWeight="bold">
              マイページ
            </Text>
            <Box h="16" w="16" />
          </HStack>
        </Box>
        <Box py="6">
          <VStack space="8">
            {Object.entries(MENU).map(([title, items]) => (
              <VStack key={title} space="4">
                <Box px="4">
                  <Text fontSize="sm" color="text.900" fontWeight="bold">
                    {title}
                  </Text>
                </Box>
                <VStack>
                  {items.map((item, index) => (
                    <Pressable
                      key={item.title}
                      px="4"
                      bg="white"
                      onPress={item.onPress}
                    >
                      <HStack
                        py="5"
                        justifyItems="center"
                        justifyContent="space-between"
                        borderBottomColor="muted.200"
                        borderBottomWidth={
                          index !== items.length - 1 ? '1' : '0'
                        }
                      >
                        <Text>{item.title}</Text>
                        <Icon
                          as={<IconChevronRight size="24" strokeWidth={1} />}
                          color="muted.500"
                        />
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              </VStack>
            ))}
          </VStack>
        </Box>
      </ScrollView>
      <BottomNavigation />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  )
}
