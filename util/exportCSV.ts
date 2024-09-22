import { HOW_TO_SELL } from '~/src/const/config'
import type { User } from '@prisma/client'
import Encoding from 'encoding-japanese'
import type { OrderDetailsWithStock } from '~/@types/order'

// 顧客情報をCSV形式に変換する関数
export const convertClientInfoToCSV = (users: User[]): string => {
  const headers =
    'アカウントステータス,ID,メールアドレス,店舗名,請求先会社名,店舗電話番号,該当の業界,郵便番号,都道府県,市区町村,その先住所,名前,名前（カタカナ）,振込名義,振込名義（カタカナ）,作成日時,更新日時,最終ログイン日時\n'
  const data = users
    .map(
      (user) =>
        `${user.approvalStatus},${user.id},${user.email},${user.shopName},${user.companyName},${user.phoneNumber},${user.businessType},${user.postalCode},${user.prefecture},${user.city},${user.addressLine},${user.name},${user.nameKana},${user.transferName},${user.transferNameKana},${user.createdAt},${user.updatedAt},${user.lastLogin}`
    )
    .join('\n')
  return headers + data
}

// 注文情報をCSV形式に変換する関数
export const convertOrderInfoToCSV = (
  orders: OrderDetailsWithStock[]
): string => {
  const productGroups: Record<
    string,
    {
      shopName?: string
      quantity: number
      unitType?: string
      price: number
      totalStock?: number
    }[]
  > = {}
  for (const order of orders) {
    if (order.items) {
      for (const item of order.items) {
        const unitType = item.unitType ? HOW_TO_SELL[item.unitType] : ''
        const productName = unitType
          ? `${item.productName} (${unitType})`
          : item.productName
        if (!productGroups[productName]) {
          productGroups[productName] = []
        }
        productGroups[productName].push({
          shopName: order.user?.shopName,
          quantity: item.quantity,
          unitType: unitType,
          price: item.price,
          totalStock: item.currentStock ?? 0
        })
      }
    }
  }
  // 1行目のヘッダー
  const headers = `,${Object.keys(productGroups)
    .map((productName) => {
      const price = productGroups[productName][0].price
      const totalStock = productGroups[productName][0].totalStock
      return `${productName},金額: ${price}円,登録してある残り在庫数: ${totalStock}匹,`
    })
    .join(',')}`
  // 2行目のサブヘッダー
  const subHeaders = `,${Object.keys(productGroups)
    .map(() => '会社名,発注量,重さ,備考')
    .join(',')}`
  // データ行の生成
  const maxRows = Math.max(
    ...Object.values(productGroups).map((group) => group.length)
  )
  const dataRows = Array.from({ length: maxRows })
    .map((_, rowIndex) => {
      return `,${Object.keys(productGroups)
        .map((productName) => {
          const item = productGroups[productName][rowIndex]
          if (item) {
            return `${item.shopName},${item.quantity},,`
          }
          return ',,,'
        })
        .join(',')}`
    })
    .join('\n')
  return `${headers}\n${subHeaders}\n${dataRows}`
}

/**
 * csvのダウンロードを行う機能
 * 引数にcsvのデータを渡すと、csvファイルをダウンロードする
 * 要素のonClickにこの関数をバインドすることで、ボタンクリック時にcsvファイルをダウンロードできる
 * @param csvData
 *
 */
export const downloadCSV = (csvData: string, fileName: string) => {
  // CSVデータをUnicodeからSJISのバイト配列に変換
  const sjisArray = Encoding.convert(Encoding.stringToCode(csvData), 'SJIS')
  const blob = new Blob([new Uint8Array(sjisArray)], {
    type: 'text/csv;charset=Shift_JIS;'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
