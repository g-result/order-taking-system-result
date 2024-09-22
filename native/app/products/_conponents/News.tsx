import { useState } from 'react'
import { Box, Text, Button, Pressable, HStack, Badge, Modal } from 'native-base'
import { nativeApi } from '@/lib/trpc'
import { IconChevronRight } from '@tabler/icons-react-native'
export const News = () => {
  const [showModal, setShowModal] = useState(false)
  const {
    data: news,
    error: newsError,
    isLoading: isLoadingNews
  } = nativeApi.news.findOne.useQuery()

  if (!news) return <></>
  return (
    <>
      <Box pb="3">
        <HStack
          alignItems="center"
          justifyContent="space-between"
          bg="error.500"
          px="4"
          py="2.5"
        >
          <Pressable onPress={() => setShowModal(true)}>
            <HStack space={2} alignItems="center">
              <Badge variant="outline" colorScheme="error" bg="white">
                <Text fontSize="xs" color="error.500">
                  お知らせ
                </Text>
              </Badge>
              <Text fontSize="sm" color="white">
                {news?.title}
              </Text>
            </HStack>
          </Pressable>
          <IconChevronRight size="20" color="white" />
        </HStack>
      </Box>
      {/* お知らせモーダル */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            <HStack justifyContent="space-between" alignItems="center" w="100%">
              <Text fontSize="md" fontWeight="bold" color="text.900">
                {news?.title}
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <Text fontSize="sm" color="text.900">
              {news?.content}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="outline"
                color="muted.500"
                borderRadius="4"
                onPress={() => setShowModal(false)}
              >
                <Text color="text.900">閉じる</Text>
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  )
}
