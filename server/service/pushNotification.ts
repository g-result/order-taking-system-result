import { Expo, type ExpoPushMessage } from 'expo-server-sdk'
import { expo } from '~/lib/expo/push'
import { userRepository } from '../repository/user'

const DEFAULT_MESSAGE_CONTENT: Omit<ExpoPushMessage, 'to'> = {
  sound: 'default',
  body: 'プッシュ通知のテストです',
  data: { withSome: 'data' }
}

/**
 * 全ユーザーにプッシュ通知を送る
 * */
export async function sendPushNotificationAllUser(
  messageContent = DEFAULT_MESSAGE_CONTENT
) {
  const users = await userRepository.findAll()
  const tokens = users
    .filter((user) => user.pushNotificationEnabled) // Push通知が有効なユーザーのみをフィルタリング
    .map((user) => user.devicePushToken)
  for (const token of tokens) {
    try {
      if (!token) {
        console.error('Token is missing for a user')
        continue
      }
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Invalid Expo push token: ${token}`)
        continue
      }
      const message: ExpoPushMessage = { ...messageContent, to: token }
      const ticket = await expo.sendPushNotificationsAsync([message])
      console.log(`Sending notification to ${token}`)
      // Expoサーバーのレスポンスをログに記録
      if (ticket[0].status === 'error') {
        console.error(
          `Failed to send notification to ${token}:`,
          ticket[0].message
        )
      } else {
        console.log(`Notification sent to ${token}:`, ticket[0].id)
      }
    } catch (error) {
      console.error(`Error sending notification to ${token}:`, error)
    }
  }
}
// export async function sendPushNotificationAllUser(
//   messageContent = DEFAULT_MESSAGE_CONTENT
// ) {
//   const users = await userRepository.findAll()
//   const tokens = users.map((user) => user.devicePushToken)
//   for (const token of tokens) {
//     try {
//       if (!token) {
//         console.error('Token is missing for a user')
//         continue
//       }
//       if (!Expo.isExpoPushToken(token)) {
//         console.error(`Invalid Expo push token: ${token}`)
//         continue
//       }
//       const message: ExpoPushMessage = { ...messageContent, to: token }
//       const ticket = await expo.sendPushNotificationsAsync([message])
//       console.log(`Sending notification to ${token}`)
//       // Expoサーバーのレスポンスをログに記録
//       if (ticket[0].status === 'error') {
//         console.error(
//           `Failed to send notification to ${token}:`,
//           ticket[0].message
//         )
//       } else {
//         console.log(`Notification sent to ${token}:`, ticket[0].id)
//       }
//     } catch (error) {
//       console.error(`Error sending notification to ${token}:`, error)
//     }
//   }
// }

/**
 * あるユーザーにプッシュ通知を送る
 * */
export async function sendPushNotificationUser(
  userId: string,
  messageContent = DEFAULT_MESSAGE_CONTENT
): Promise<void> {
  const user = await userRepository.findUnique(userId)
  const token = user?.devicePushToken
  if (!token) return
  try {
    const message: ExpoPushMessage = { ...messageContent, to: token }
    const ticket = await expo.sendPushNotificationsAsync([message])
    console.log(ticket)
  } catch (error) {
    console.error(error)
  }
}
