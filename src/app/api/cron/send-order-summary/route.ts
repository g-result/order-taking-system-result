import dayjs from 'dayjs'
import { convertOrderInfoToCSV } from '~/util/exportCSV'
import { sendMailWithCsv } from '~/lib/nodemailer'
import { prisma } from '~/prisma/prismaClient'
import { NextResponse, type NextRequest } from 'next/server'
import type { OrderDetails } from '~/@types/order'

// 注文履歴のまとめ(CSV)を発注終了時間（毎朝09:00）に出力してメールに添付して送付する。
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  try {
    const startDate = dayjs().subtract(1, 'day').hour(15).minute(0).second(0)
    const endDate = dayjs().hour(9).minute(0).second(0)
    const orders: OrderDetails[] = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: startDate.toDate(),
          lt: endDate.toDate()
        }
      },
      include: {
        user: true,
        items: true
      }
    })
    const csvData = convertOrderInfoToCSV(orders)
    const csvTitle = `${startDate.format('YYYYMMDD_HHmm')}_${endDate.format(
      'YYYYMMDD_HHmm'
    )}_orders.csv`

    await sendMailWithCsv({
      sender: process.env.SENDER_EMAIL ?? '',
      receiver: process.env.RECEIVER_EMAIL ?? '',
      subject: '注文情報',
      message: '注文情報を添付します',
      csvData: csvData,
      csvTitle: csvTitle
    })
    return NextResponse.json({ message: 'Order summary sent successfully' })
  } catch (error) {
    console.error('Error sending order summary:', error)
    return NextResponse.json(
      { error: 'Failed to send order summary' },
      { status: 500 }
    )
  }
}
