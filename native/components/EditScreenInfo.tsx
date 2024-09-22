import React from 'react'
import { ExternalLink } from './ExternalLink'
import { View, Text } from 'native-base'

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View>
        <Text>Open up the code for this screen:</Text>
        <Text>
          <Text>{path}</Text>
        </Text>
        <Text>
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>

      <View>
        {/* <ExternalLink href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"> */}
        <Text>
          Tap here if your app doesn't automatically update after making changes
        </Text>
        {/* </ExternalLink> */}
      </View>
    </View>
  )
}
