import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
})
/**
 * 通知の許可を求める
 * */
export async function requestPermissionsAsync(): Promise<
  Notifications.PermissionStatus | undefined
> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    console.log('status', status)
    return status
  }
  return existingStatus
}
/**
 * 通知登録
 * */
export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use physical device for push notifications')
    return
  }
  const status = await requestPermissionsAsync()
  if (status !== 'granted') {
    handleRegistrationError(
      'Permission not granted to get push token for push notification!'
    )
    return
  }
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId
  if (!projectId) {
    handleRegistrationError('Project ID not found')
  }
  console.log('projectId', projectId)

  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId
      })
    ).data
    return pushTokenString
  } catch (e: unknown) {
    handleRegistrationError(`${e}`)
  }
}
/**
 * 通知を送る
 * */
export async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' }
  }

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })
}

function handleRegistrationError(errorMessage: string) {
  // alert(errorMessage)
  // throw new Error(errorMessage)
}
