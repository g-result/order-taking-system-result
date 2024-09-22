import { Box, IconButton, Text, HStack, StatusBar } from 'native-base'
import { IconChevronLeft } from '@tabler/icons-react-native'
export const Header = ({
  onPressBack,
  title
}: {
  onPressBack: () => void
  title: string
}) => {
  return (
    <>
      <Box safeAreaTop>
        <StatusBar />
      </Box>
      <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
        <HStack alignItems="center" justifyContent="space-between" space="4">
          <IconButton
            icon={<IconChevronLeft size="24" color="black" />}
            w="16"
            h="16"
            onPress={onPressBack}
            color="black"
          />

          <Text fontSize="md" color="black" fontWeight="bold">
            {title}
          </Text>
          <Box h="16" w="16" />
        </HStack>
      </Box>
    </>
  )
}
