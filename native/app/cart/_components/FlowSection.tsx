import { Box, Text, VStack, HStack } from 'native-base'
import {
  IconNotes,
  IconShoppingCart,
  IconCheck
} from '@tabler/icons-react-native'
import type { OrderStatus } from '..'

export default function FlowSection({ status }: { status: OrderStatus }) {
  return (
    <HStack bg="white" py="3" justifyContent="center">
      <HStack justifyContent="space-between" w="64" position="relative">
        <VStack space="1" zIndex="2">
          <HStack
            bg={status === 'CART' ? 'black' : 'muted.300'}
            w="10"
            h="10"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <IconShoppingCart size="24" color="white" />
          </HStack>
          <Text
            color={status === 'CART' ? 'darkBlue.900' : 'muted.300'}
            fontSize="xs"
            fontWeight="bold"
            textAlign="center"
          >
            カート
          </Text>
        </VStack>
        <Box
          w="80%"
          h="1px"
          bg="muted.300"
          position="absolute"
          top="5"
          left="10%"
          zIndex="1"
        />
        <VStack space="1" zIndex="2">
          <HStack
            bg={status === 'ORDER_CONFIRM' ? 'black' : 'muted.300'}
            w="10"
            h="10"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <IconNotes size="24" color="white" />
          </HStack>
          <Text
            color={status === 'ORDER_CONFIRM' ? 'darkBlue' : 'muted.300'}
            fontSize="xs"
            fontWeight="bold"
            textAlign="center"
          >
            注文確認
          </Text>
        </VStack>
        <Box position="absolute" />
        <VStack space="1" zIndex="2">
          <HStack
            bg={status === 'ORDER_COMPLETE' ? 'black' : 'muted.300'}
            w="10"
            h="10"
            borderRadius="full"
            alignItems="center"
            justifyContent="center"
          >
            <IconCheck size="24" color="white" />
          </HStack>
          <Text
            color={status === 'ORDER_COMPLETE' ? 'darkBlue.900' : 'muted.300'}
            fontSize="xs"
            fontWeight="bold"
            textAlign="center"
          >
            注文完了
          </Text>
        </VStack>
      </HStack>
    </HStack>
  )
}
