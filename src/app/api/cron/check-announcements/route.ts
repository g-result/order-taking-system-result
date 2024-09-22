import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '~/prisma/prismaClient'
import dayjs from 'dayjs'
import { sendPushNotificationAllUser } from '~/server/service/pushNotification'
import type { ExpoPushMessage } from 'expo-server-sdk'

const ANNOUNCEMENT_MESSAGE_CONTENT: Omit<ExpoPushMessage, 'to'> = {
  sound: 'default',
  body: 'お知らせが配信されました！',
  data: { withSome: 'announcement' }
}

// 毎分配信するお知らせがあるか確認する関数
// export async function GET(req: NextRequest) {
//   const authHeader = req.headers.get('authorization')
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return new Response('Unauthorized', { status: 401 })
//   }
//   const now = dayjs()
//   const announcements = await prisma.news.findMany({
//     where: {
//       publishedAt: {
//         lte: now.toDate()
//       },
//       publishedEndAt: {
//         gte: now.toDate()
//       }
//     }
//   })
//   if (announcements.length > 0) {
//     console.log('配信するお知らせがあります:', announcements)
//     await sendPushNotificationAllUser(ANNOUNCEMENT_MESSAGE_CONTENT)
//   } else {
//     console.log('配信するお知らせはありません')
//   }

//   return NextResponse.json({ message: 'Check completed' })
// }
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const now = dayjs()
  const announcements = await prisma.news.findMany({
    where: {
      publishedAt: {
        lte: now.toDate()
      },
      publishedEndAt: {
        gte: now.toDate()
      },
      notified: false
    }
  })
  if (announcements.length > 0) {
    console.log('配信するお知らせがあります:', announcements)
    await sendPushNotificationAllUser(ANNOUNCEMENT_MESSAGE_CONTENT)
    // 通知済みフラグを更新
    await prisma.news.updateMany({
      where: {
        id: {
          in: announcements.map((a) => a.id)
        }
      },
      data: {
        notified: true
      }
    })
  } else {
    console.log('配信するお知らせはありません')
  }

  return NextResponse.json({ message: 'Check completed' })
}
