import React from 'react'
import { Box, ScrollView, Text, VStack, Heading, Flex } from 'native-base'
import { useRouter } from 'expo-router'
import policyData from '../../../const/policyData.json'
import { Header } from '@/components/Header'

export default function NotesPage() {
  const router = useRouter()
  return (
    <>
      <Header
        title={'プライバシーポリシー'}
        onPressBack={() => router.replace('/my-page/')}
      />
      <ScrollView bg="coolGray.100">
        <Box p={5}>
          <Heading size="xs" fontWeight="bold" textAlign="center" pt="2" pb="5">
            アプリケーション・プライバシーポリシー
          </Heading>
          <VStack space={5}>
            <Text fontSize="xs">
              株式会社山一水産（以下「当社」といいます。）は、当社の提供するアプリケーション（以下「本アプリケーション」）の利用者の個人情報（以下「ユーザー情報」といいます。）の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
            </Text>
            {policyData.map((policy) => (
              <Box key={policy.title}>
                <Heading size="xs" fontWeight="bold" mb=".5em">
                  {policy.title}
                </Heading>
                {policy.content.map(
                  (item: {
                    numberList?: {
                      text?: string
                      listItems?: string[]
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
          </VStack>
        </Box>
      </ScrollView>
    </>
  )
}
