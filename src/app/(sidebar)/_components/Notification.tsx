'use client'
import { Notification as MantineNotification } from '@mantine/core'

type NotificationProps = {
  visible: boolean
  onClose?: () => void
}

export default function Notification({ visible, onClose }: NotificationProps) {
  if (!visible) return null

  return (
    <MantineNotification
      withBorder
      title="登録が完了しました"
      w={372}
      onClose={onClose}
      pos="fixed"
      top={32}
      right={32}
      styles={{
        root: {
          zIndex: 9999
        }
      }}
    >
      商品の登録が正常に完了しました。
    </MantineNotification>
  )
}
