import React from 'react'
import { Box, ScrollView, Text, VStack, Heading } from 'native-base'
import { useRouter } from 'expo-router'
import notesData from '../../../const/notesData.json'
import { Header } from '@/components/Header'

export default function NotesPage() {
  const router = useRouter()
  return (
    <>
      <Header
        title={'丸魚体請求などの注意事項'}
        onPressBack={() => router.replace('/my-page/')}
      />
      <ScrollView bg="coolGray.100">
        <Box p={5}>
          <Heading size="xs" fontWeight="bold" textAlign="center" pt="2" pb="5">
            実目方請求と丸魚体請求の違いについて
          </Heading>
          <VStack space={2}>
            {notesData.map((note) => (
              <Box key={note.title}>
                {' '}
                <Heading size="xs" fontWeight="bold" mb=".5em">
                  {note.title}
                </Heading>
                <Text fontSize="xs">
                  {note.content.split('\n').map((line, index, array) => (
                    <React.Fragment key={`${note.title}-${index}`}>
                      {line}
                      {index < array.length - 1 && '\n'}
                    </React.Fragment>
                  ))}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </>
  )
}
