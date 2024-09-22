import React from 'react'
import { Badge } from '@mantine/core'

export const YenBadge = () => {
  return (
    <Badge
      w="34"
      h="36"
      color="gray.1"
      radius="4"
      fz="sm"
      c="#000"
      p="0"
      ml="5"
      styles={{
        root: {
          flexShrink: '0',
          border: '1px solid #CED4DA'
        }
      }}
    >
      円
    </Badge>
  )
}
