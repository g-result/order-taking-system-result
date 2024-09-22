import { policyData } from '@/const/policyData'
import { Box, Flex, Text, Title } from '@mantine/core'
import React from 'react'

export default function NotesPage() {
  return (
    <>
      <Title>プライバシーポリシー</Title>
      <Box p={5}>
        <Title size="xs" pt="2" pb="5">
          アプリケーション・プライバシーポリシー
        </Title>
        <Box>
          <Text>
            株式会社山一水産（以下「当社」といいます。）は、当社の提供するアプリケーション（以下「本アプリケーション」）の利用者の個人情報（以下「ユーザー情報」といいます。）の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </Text>
          {policyData.map((policy) => (
            <Box key={policy.title}>
              <Title size="xs" mb=".5em">
                {policy.title}
              </Title>
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
                          <Text>{`${index + 1}. `}</Text>
                          <Box>
                            <Text>{item.text}</Text>
                            {item.listItems?.map((listItem) => (
                              <Flex direction="row" key={listItem}>
                                <Text>・</Text>
                                <Text>{listItem}</Text>
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
                        <Text>・</Text>
                        <Text>{listItem}</Text>
                      </Flex>
                    ))
                  }
                  return <Text key={item.text}>{item.text}</Text>
                }
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </>
  )
}
