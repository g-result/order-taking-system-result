import path from 'node:path'
import fs from 'node:fs'
import SVGtoPDF from 'svg-to-pdfkit'
import PDFDocument from 'pdfkit'

export const generatePdf = (svg: string, fontPath: string) => {
  try {
    const doc = new PDFDocument({
      font: path.join(fontPath)
    })
    const buffers: Buffer[] = []

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers).toString('base64')
      return pdfData
    })

    // カスタムフォントを設定
    doc.registerFont('NotoSansJP-Bold', fontPath)
    doc.font('NotoSansJP-Bold')

    // SVGをPDFに変換
    SVGtoPDF(doc, svg, 0, 0)
    doc.end()

    // PDFデータを返す
    return new Promise<string>((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers).toString('base64')
        resolve(pdfData)
      })
    })
  } catch (error) {
    console.error(error)
  }
}
