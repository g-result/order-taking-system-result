import * as Notifications from 'expo-notifications'
import { useState, useEffect, useRef } from 'react'
import { nativeApi } from '@/lib/trpc'
import { registerForPushNotificationsAsync } from '@/lib/expo'

export const usePushNotification = () => {
  const [expoPushToken, setExpoPushToken] = useState('')
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()
  const updateDevicePushToken =
    nativeApi.user.updateDevicePushToken.useMutation()

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        updateDevicePushToken.mutateAsync(token ?? '')
        setExpoPushToken(token ?? '')
      })
      .catch((error: unknown) => setExpoPushToken(`${error}`))

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification)
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response)
      })

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        )
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])
  return {
    expoPushToken,
    notification
  }
}
