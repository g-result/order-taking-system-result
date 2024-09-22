import React from 'react'
import { Box, ScrollView, Text, VStack, Heading, Flex } from 'native-base'
import { useRouter } from 'expo-router'
import termsData from '../../../const/termsData.json'
import { Header } from '@/components/Header'

export default function NotesPage() {
  const router = useRouter()
  return (
    <>
      <Header
        title={'利用規約'}
        onPressBack={() => router.replace('/my-page/')}
      />
      <ScrollView bg="coolGray.100">
        <Box p={5}>
          <Heading size="xs" fontWeight="bold" textAlign="center" pt="2" pb="5">
            「Yamaichi-J」 利用規約
          </Heading>
          <VStack space={5}>
            <Text fontSize="xs">
              株式会社山一水産（以下「当社」といいます。）が提供する「Yamaichi-J」（以下「本サービス」といいます。）の利用に関して、会員及び利用希望者に同意していただく必要のある事柄を記載しています。
              {'\n'}
              本サービスをご利用になる際には、この「Yamaichi-J」利用規約（以下「本規約」といいます。）が適用されます。尚、本規約については、利用希望者が利用登録した時点又は本サービスをご利用いただいた時点で同意されたものとさせていただきますので、ご利用の前に必ずお読みください。
            </Text>
            {termsData.map((term) => (
              <Box key={term.title}>
                <Heading size="xs" fontWeight="bold" mb=".5em">
                  {term.title}
                </Heading>
                {term.content.map(
                  (item: {
                    numberList?: {
                      text?: string
                      listItems?: string[]
                      subNumber?: string[]
                    }[]
                    text?: string
                    listItems?: string[]
                  }) => {
                    if (item.numberList) {
                      return item.numberList.map((item, index) => (
                        <Box key={item.text}>
                          <Flex direction="row">
                            <Text fontSize="xs">{`${index + 1}. `}</Text>
                            <Box flexShrink={1}>
                              <Text fontSize="xs">{item.text}</Text>
                              {item.listItems?.map((listItem) => (
                                <Flex direction="row" key={listItem}>
                                  <Text fontSize="xs">・</Text>
                                  <Text fontSize="xs" flexShrink={1}>
                                    {listItem}
                                  </Text>
                                </Flex>
                              ))}
                              {item.subNumber?.map((subItem, index) => (
                                <Flex direction="row" key={subItem}>
                                  <Text fontSize="xs">{`(${index + 1}) `}</Text>
                                  <Text fontSize="xs" flexShrink={1}>
                                    {subItem}
                                  </Text>
                                </Flex>
                              ))}
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    }
                    if (item.listItems) {
                      return item.listItems.map((listItem) => (
                        <Flex direction="row" key={listItem}>
                          <Text fontSize="xs">・</Text>
                          <Text fontSize="xs" flexShrink={1}>
                            {listItem}
                          </Text>
                        </Flex>
                      ))
                    }
                    return (
                      <Text key={item.text} fontSize="xs">
                        {item.text}
                      </Text>
                    )
                  }
                )}
              </Box>
            ))}
            <Text fontSize="xs">制定日：2024年7月1日</Text>
          </VStack>
        </Box>
      </ScrollView>
    </>
  )
}
