import { Flex, Text } from 'native-base'
import { useWindowDimensions } from 'react-native'

const TITLE = '商品準備中です'
// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
const MESSAGE = `9~15時は商品準備中のため商品の注文ができません。\n電話またはLINEでご注文をお願いします。`
export const NotReadyGlassOverlay = () => {
  const { height } = useWindowDimensions()
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(255,255,255,0.8)"
      justifyContent="center"
      alignItems="center"
      zIndex={1}
      h={height - 100}
    >
      <Text fontWeight="bold" fontSize={'lg'}>
        {TITLE}
      </Text>
      <Text p="3">{MESSAGE}</Text>
    </Flex>
  )
}
export const NotReadyText = () => {
  const { height } = useWindowDimensions()
  return (
    <Flex
      backgroundColor="rgba(255,255,255,0.8)"
      justifyContent="center"
      alignItems="center"
      h={height - 200}
    >
      <Text fontWeight="bold" fontSize={'lg'}>
        {TITLE}
      </Text>
      <Text p="3">{MESSAGE}</Text>
    </Flex>
  )
}
