import { useState } from 'react'
import { Box, Text, HStack, StatusBar } from 'native-base'
import EmailSubmit from './_components/EmailSubmit'
import EmailComplete from './_components/EmailComplete'

export type PasswordResetStep = 'init' | 'sended' | 'reset' | 'success'
export default function ResetPasswordScreen() {
  const [step, setStep] = useState<PasswordResetStep>('init')

  return (
    <Box flex={1}>
      <Box safeAreaTop>
        <StatusBar />
      </Box>
      <Box borderBottomWidth="1" borderBottomColor="muted.300" bg="white">
        <HStack alignItems="center" justifyContent="space-between" space="4">
          <Box h="16" w="16" />
          <Text fontSize="md" color="black" fontWeight="bold">
            {step === 'init' && 'パスワード再発行メール送信'}
            {step === 'sended' && 'パスワード再発行メール送信完了'}
          </Text>
          <Box h="16" w="16" />
        </HStack>
      </Box>
      {step === 'init' && <EmailSubmit setStep={setStep} />}
      {step === 'sended' && <EmailComplete setStep={setStep} />}
    </Box>
  )
}
