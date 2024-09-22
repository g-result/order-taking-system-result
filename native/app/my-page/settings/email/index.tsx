import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Box } from 'native-base'
import BottomNavigation from '@/components/BottomNavigation'
import SuccessComponent from './_components/Success'
import { EmailFormComponent } from './_components/EmailForm'
import { Header } from '@/components/Header'

export type EmailStep = 'init' | 'success'

export default function EmailUpdateScreen() {
  const [step, setStep] = useState<EmailStep>('init')
  const router = useRouter()
  return (
    <Box flex={1}>
      <Header
        title={
          step === 'init' ? 'メールアドレス変更' : 'メールアドレス変更完了'
        }
        onPressBack={() => router.replace('/my-page/')}
      />

      {step === 'init' && <EmailFormComponent setStep={setStep} />}
      {step === 'success' && <SuccessComponent />}
      <BottomNavigation />
    </Box>
  )
}
