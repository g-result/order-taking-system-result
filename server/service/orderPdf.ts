import { OrderInfoSvgData } from '~/lib/satori/orderInfo'

import path from 'node:path'
import fs from 'node:fs'
import { generatePdf } from '~/lib/pdfGenerator'
import { PDFDocument } from 'pdf-lib'
import type { OrderDetails } from '~/@types/order'

// 注文情報をPDFに変換し、メールで送付用のPDFを生成する
export const generateOrderPdf = async (
  orderDetails: OrderDetails
): Promise<string> => {
  // ローカルフォントファイルのパスを設定
  const fontPath = path.resolve('public/font/NotoSansJP-Bold-WebSubset.woff')

  // フォントファイルの読み込み
  const fontData = fs.readFileSync(fontPath)

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
  const mergedPdfBuffer = Buffer.from(mergedPdf).toString('base64')

  return mergedPdfBuffer
}

// 複数のPDFを結合する
const mergePdfs = async (pdfs: Buffer[]): Promise<Uint8Array> => {
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
