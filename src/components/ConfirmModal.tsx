import React from 'react'
import { Modal, Button, Group, Text, Badge } from '@mantine/core'

type ConfirmModalProps = {
  texts: string[]
  confirmOpened: boolean
  confirmClose: () => void
  setConfirm: (isConfirm: boolean) => void
}

export const ConfirmModal = ({
  texts,
  confirmOpened,
  confirmClose,
  setConfirm
}: ConfirmModalProps) => {
  return (
    <>
      <Modal
        opened={confirmOpened}
        onClose={confirmClose}
        size="md"
        title="確認"
      >
        {texts.map((text) => (
          <Text key={text}>{text}</Text>
        ))}

        <Group mt="xl" justify="flex-end">
          <Button size="sm" onClick={() => setConfirm(false)} variant="default">
            いいえ
          </Button>
          <Button size="sm" onClick={() => setConfirm(true)}>
            はい
          </Button>
        </Group>
      </Modal>
    </>
  )
}
