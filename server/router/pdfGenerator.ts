import { z } from 'zod'
import { router } from '~/lib/trpc/trpc'
import { SvgData } from '~/lib/satori'
import { userProcedure } from '../middleware'
import path from 'node:path'
import fs from 'node:fs'
import { generatePdf } from '~/lib/pdfGenerator'
import type { OrderDetails } from '~/@types/order'
import { OrderInfoSvgData } from '~/lib/satori/orderInfo'
import { PDFDocument } from 'pdf-lib'

// ミューテーションのスキーマを定義
const generateFromContentSchema = z.object({
  content: z.string()
})

// 複数のPDFを結合する
const mergePdfs = async (pdfs: Buffer[]) => {
  const mergedPdf = await PDFDocument.create()
  for (const pdfBuffer of pdfs) {
    const pdf = await PDFDocument.load(pdfBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    for (const page of copiedPages) {
      mergedPdf.addPage(page)
    }
  }
  const savedPdf = await mergedPdf.save()
  return savedPdf
}

export const pdfRouter = router({
  generateFromContent: userProcedure
    .input(generateFromContentSchema)
    .mutation(async ({ input: { content } }) => {
      try {
        // ローカルフォントファイルのパスを設定
        const fontPath = path.resolve(
          'public/font/NotoSansJP-Bold-WebSubset.woff'
        )
        // フォントファイルの読み込み
        const fontData = fs.readFileSync(fontPath)
        const svg = await SvgData(content, fontData)
        const pdf = generatePdf(svg, fontPath)
        return pdf
      } catch (error) {
        console.error(error)
      }
    }),
  // SVGからPDFを生成
  // 管理画面の注文情報をPDFに変換
  generateOrderInfo: userProcedure
    .input(generateFromContentSchema)
    .mutation(async ({ input }) => {
      try {
        const { content } = input
        // ローカルフォントファイルのパスを設定
        const fontPath = path.resolve(
          'public/font/NotoSansJP-Bold-WebSubset.woff'
        )

        // フォントファイルの読み込み
        const fontData = fs.readFileSync(fontPath)
        const orderDetails: OrderDetails = JSON.parse(content)
        const svgs = await OrderInfoSvgData(orderDetails, fontData)
        const pdfBuffers = await Promise.all(
          svgs.map(async (svg) => {
            const pdfString = await generatePdf(svg, fontPath)
            if (pdfString) {
              return Buffer.from(pdfString, 'base64')
            }
            throw new Error('PDF生成に失敗しました')
          })
        )
        const mergedPdf = await mergePdfs(pdfBuffers)
        return mergedPdf
      } catch (error) {
        console.error('PDF生成エラー:', error)
        throw new Error('PDF生成に失敗しました')
      }
    })
})
