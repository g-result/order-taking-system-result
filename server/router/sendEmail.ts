import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { sendMailWithPdf } from '~/lib/nodemailer'
import { userProcedure } from '../middleware'
import { generatePdf } from '~/lib/pdfGenerator'
import path from 'node:path'
import fs from 'node:fs'
import { SvgData } from '~/lib/satori'

// FIXME: svgに渡すデータ、sendMailWithPdfに渡すデータを変更してください
export const mailRouter = router({
  sendMail: userProcedure.mutation(async ({ ctx }) => {
    const fontPath = path.resolve('public/font/NotoSansJP-Bold-WebSubset.woff')
    const fontData = fs.readFileSync(fontPath)

    const svg = await SvgData('s', fontData)
    const pdfData = await generatePdf(svg, fontPath)
    if (pdfData !== undefined) {
      // TODO:修正してください
      await sendMailWithPdf({
        sender: 'junpei_asanuma@if-tech.co.jp',
        // receiver: ctx.supabaseUser?.email as string,
        receiver: 'jun64pei89@gmail.com',
        subject: '新しいメッセージ',
        message: 'これで完成！',
        pdfData
      })
    } else {
      throw new Error('pdfData is undefined')
    }
    return { msg: 'send mail' }
  })
})
