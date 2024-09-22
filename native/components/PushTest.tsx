import { Text, View, Button } from 'react-native'
import { sendPushNotification } from '@/lib/expo'
import { usePushNotification } from '@/hooks/pushNotification'

export const PushTest = () => {
  const { expoPushToken, notification } = usePushNotification()

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}
    >
      <Text>開発用テスト</Text>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification?.request.content.title} </Text>
        <Text>Body: {notification?.request.content.body}</Text>
        <Text>
          Data:{' '}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => await sendPushNotification(expoPushToken)}
      />
    </View>
  )
}
