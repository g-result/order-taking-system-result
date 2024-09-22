import React from 'react'
import { Modal, Button, Group, Text, Badge } from '@mantine/core'

type ErrorModalProps = {
  errors: string[]
  errorOpened: boolean
  errorClose: () => void
}

export const ErrorModal = ({
  errors,
  errorOpened,
  errorClose
}: ErrorModalProps) => {
  return (
    <>
      <Modal
        opened={errorOpened}
        onClose={errorClose}
        size="md"
        title="エラー表示"
      >
        {errors.map((error) => (
          <Text key={error}>{error}</Text>
        ))}
        {errors.length === 0 && (
          <Text>商品の単価、もしくは、割引料金を設定してください。</Text>
        )}

        <Group mt="xl" justify="flex-end">
          <Button size="sm" onClick={errorClose}>
            閉じる
          </Button>
        </Group>
      </Modal>
    </>
  )
}
