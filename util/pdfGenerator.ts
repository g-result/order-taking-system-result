// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * フロントエンドでPDFを生成する際に使用する関数
 * @param htmlElement - PDFに変換したいHTML要素（useRefで取得した要素を渡す)
 * @returns PDFオブジェクト
 *
 * ※注意※
 * この関数はフロントエンドでのみ使用可能です。
 * サーバーサイドでPDFを生成する場合は、server/router/pdfGenerator.tsを確認し、使用してください。
 *  */

export const generatePdfInFrontend = async (htmlElement: HTMLElement) => {
  const canvas = await html2canvas(htmlElement)
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF()
  const imgProps = pdf.getImageProperties(imgData)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
  return pdf
}
