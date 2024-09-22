import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Box } from 'native-base'
import BottomNavigation from '@/components/BottomNavigation'
import PasswordComponent from './_components/PasswordForm'
import SuccessComponent from './_components/Success'
import { Header } from '@/components/Header'

export type PasswordUpdateStep = 'init' | 'success'
export default function PasswordUpdateScreen() {
  const [step, setStep] = useState('init')
  const router = useRouter()

  return (
    <Box flex={1}>
      <Header
        title={
          step === 'init'
            ? 'パスワード変更'
            : step === 'success'
              ? 'パスワード変更完了'
              : ''
        }
        onPressBack={() => router.replace('/my-page/')}
      />
      {step === 'init' && <PasswordComponent setStep={setStep} />}
      {step === 'success' && <SuccessComponent />}
      <BottomNavigation />
    </Box>
  )
}
