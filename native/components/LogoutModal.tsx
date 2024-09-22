// LogoutModal.tsx
import type React from 'react'
import { Text, HStack, Button, Modal } from 'native-base'
import { supabase } from '@/lib/supabase'

type LogoutModalProps = {
  isOpen: boolean
  onClose: () => void
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const signout = () => {
    supabase.auth.signOut()
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>
          <HStack justifyContent="space-between" alignItems="center" w="100%">
            <Text fontSize="md" fontWeight="bold" color="text.900">
              確認
            </Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <Text fontSize="sm" color="text.900">
            ログアウトしますか？
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="outline"
              color="muted.500"
              borderRadius="4"
              onPress={onClose}
            >
              <Text color="text.900">キャンセル</Text>
            </Button>
            <Button
              variant="solid"
              bg="info.500"
              borderRadius="4"
              onPress={signout}
            >
              <Text color="text.50" fontWeight="bold">
                ログアウト
              </Text>
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}

export default LogoutModal
