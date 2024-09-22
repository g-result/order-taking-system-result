import { NextResponse } from 'next/server'
import { prisma } from '~/prisma/prismaClient'
import type { NextRequest } from 'next/server'

// 古い注文履歴を削除する関数
export async function deleteOldOrdersHandler() {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  await prisma.orderItem.deleteMany({
    where: {
      order: {
        orderDate: {
          lt: threeMonthsAgo
        }
      }
    }
  })
  await prisma.order.deleteMany({
    where: {
      orderDate: {
        lt: threeMonthsAgo
      }
    }
  })
  return NextResponse.json({ message: 'Old orders deleted.' })
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  return deleteOldOrdersHandler()
}
