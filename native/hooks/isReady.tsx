import { isDev } from '@/util/env'

export const getIsReady = (overrideUsageRestriction: boolean) => {
  if (isDev || overrideUsageRestriction) return true

  const now = new Date()
  const japanTime = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo' })
  const [time, ampm] = japanTime.split(' ')
  const [hours, minutes, seconds] = time.split(':')
  let hour = Number.parseInt(hours, 10)

  if (ampm === 'PM' && hour !== 12) {
    hour += 12
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0
  }
  return !(hour >= 9 && hour < 15)
}
