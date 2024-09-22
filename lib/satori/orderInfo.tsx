import satori from 'satori'
import type React from 'react'
import type { OrderDetails } from '~/@types/order'
import { convertUnitTypeToString } from '~/util'
import dayjs from '~/native/lib/dayjs'

const PAGE_HEIGHT = 1500
const ITEMS_PER_PAGE_FIRST_PAGE = 10 // 1ページ目に表示するアイテム数
const ITEMS_PER_PAGE_OTHER_PAGES = 20 // 2ページ目以降に表示するアイテム数

const generateOrderInfoSvg = async (
  order: OrderDetails,
  fontData: Buffer,
  pageIndex: number,
  items: OrderDetails['items'] = []
) => {
  const customerInfo = [
    { label: '請求先会社名', value: order.user?.companyName || 'N/A' },
    { label: '店舗名', value: order.user?.shopName || 'N/A' },
    { label: '店舗電話番号', value: order.user?.phoneNumber || 'N/A' },
    { label: '担当者名', value: order.user?.name || 'N/A' }
  ]

  const orderInfo = [
    { label: '注文番号', value: order.orderNumber },
    { label: '注文商品数', value: `${order.orderQuantity}点` },
    {
      label: '注文日時',
      // 本番環境で時間がずれるため、サーバーで取得した時間に＋9時間する
      value: dayjs(order.orderDate)
        .add(9, 'hour')
        .format('YYYY年MM月DD日 HH:mm')
    },
    { label: '発注メモ', value: order.memo || '発注メモはありません' }
  ]

  const tableHeaders = [
    { label: 'No', width: '6%' },
    { label: '商品名', width: '53%' },
    { label: '価格', width: '23%' },
    { label: '注文数', width: '12%' }
  ]

  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    paddingLeft: '10px',
    borderLeft: '4px solid black',
    lineHeight: '1',
    marginBottom: '20px'
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    fontWeight: '300'
  }

  const tableCellStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '8px'
  }

  const flexColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  }

  return await satori(
    <div
      style={{
        padding: '60px',
        paddingTop: '30px',
        fontFamily: 'Roboto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {pageIndex === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <h1 style={{ marginBottom: '10px' }}>注文書</h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '5px',
              width: '100%',
              fontSize: '13px',
              fontWeight: '300'
            }}
          >
            注文日: {dayjs(order.orderDate).format('YYYY年MM月DD日')}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '45%'
              }}
            >
              <h2 style={{ ...sectionHeaderStyle, marginBottom: '4px' }}>
                顧客情報
              </h2>
              {customerInfo.map((info) => (
                <p
                  key={info.label}
                  style={{
                    marginBottom: '-5px',
                    fontSize: '13px',
                    fontWeight: 300
                  }}
                >
                  {info.label}: {info.value}
                </p>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '45%'
              }}
            >
              <h2 style={{ ...sectionHeaderStyle, marginBottom: '4px' }}>
                注文情報
              </h2>
              {orderInfo.map((info) => (
                <p
                  key={info.label}
                  style={{
                    marginBottom: '-5px',
                    fontSize: '13px',
                    fontWeight: 300
                  }}
                >
                  {info.label}: {info.value}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 1ページ目の注文商品情報一覧 */}
      {pageIndex === 0 && items.length > 0 && (
        <div style={flexColumnStyle}>
          <h2 style={sectionHeaderStyle}>注文商品情報</h2>
          <table style={{ ...tableStyle, marginBottom: '10px' }}>
            <thead style={flexColumnStyle}>
              <tr style={{ display: 'flex', width: '100%' }}>
                {tableHeaders.map((header) => (
                  <th
                    key={header.label}
                    style={{ ...tableCellStyle, width: header.width }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={flexColumnStyle}>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    display: 'flex',
                    width: '100%'
                  }}
                >
                  {[
                    { key: `${item.id}-index`, value: index + 1, width: '6%' },
                    {
                      key: `${item.id}-productName`,
                      value: item.productName,
                      width: '53%'
                    },
                    {
                      key: `${item.id}-price`,
                      value: `${
                        item.pricingType === '魚'
                          ? convertUnitTypeToString({
                              unitType: item.unitType,
                              separateBackBelly: item.separateBackBelly ?? false
                            })
                          : item.salesFormat
                      } ${item.price}円 / ${item.productUnit}`,
                      width: '23%'
                    },
                    {
                      key: `${item.id}-quantity`,
                      value: `${item.quantity}点`,
                      width: '12%'
                    }
                  ].map((cell) => (
                    <td
                      key={cell.key}
                      style={{ ...tableCellStyle, width: cell.width }}
                    >
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* 2ページ目以降の注文商品情報一覧 */}
      {pageIndex > 0 && (
        <div style={flexColumnStyle}>
          <h2 style={sectionHeaderStyle}>注文商品情報</h2>
          <div
            style={{
              display: 'flex',
              marginBottom: '10px',
              width: '100%',
              fontSize: '13px',
              fontWeight: '300'
            }}
          >
            注文番号: {order.orderNumber}
          </div>
          <table style={{ ...tableStyle, marginBottom: '20px' }}>
            <thead style={flexColumnStyle}>
              <tr style={{ display: 'flex', width: '100%' }}>
                {tableHeaders.map((header) => (
                  <th
                    key={header.label}
                    style={{ ...tableCellStyle, width: header.width }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={flexColumnStyle}>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    display: 'flex',
                    width: '100%'
                  }}
                >
                  {[
                    { key: `${item.id}-index`, value: index + 1, width: '6%' },
                    {
                      key: `${item.id}-productName`,
                      value: item.productName,
                      width: '53%'
                    },
                    {
                      key: `${item.id}-price`,
                      value: `${
                        item.unitType
                          ? convertUnitTypeToString({
                              unitType: item.unitType,
                              separateBackBelly: item.separateBackBelly ?? false
                            })
                          : item.salesFormat
                      } ${item.price}円 / ${item.productUnit}`,
                      width: '23%'
                    },
                    {
                      key: `${item.id}-quantity`,
                      value: `${item.quantity}点`,
                      width: '12%'
                    }
                  ].map((cell) => (
                    <td
                      key={cell.key}
                      style={{ ...tableCellStyle, width: cell.width }}
                    >
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageIndex === 0 && (
        <div style={flexColumnStyle}>
          <h2 style={{ ...sectionHeaderStyle }}>注文メモ</h2>
          <div
            style={{
              border: '1px solid black',
              height: '150px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {order.memo || '注文メモはありません'}
          </div>
        </div>
      )}
    </div>,
    {
      width: 860,
      height: PAGE_HEIGHT,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 400,
          style: 'normal'
        }
      ]
    }
  )
}
export const OrderInfoSvgData = async (
  order: OrderDetails,
  fontData: Buffer
) => {
  const items = order.items || []
  const svgs = []

  if (items.length <= ITEMS_PER_PAGE_FIRST_PAGE) {
    // 10個以内の場合、1ページにすべての情報を表示
    const svg = await generateOrderInfoSvg(order, fontData, 0, items)
    svgs.push(svg)
  } else {
    // 10個を超える場合、1ページ目にヘッダーとメモのみを表示
    const headerSvg = await generateOrderInfoSvg(order, fontData, 0, [])
    svgs.push(headerSvg)

    // 2ページ目以降に注文を20個ずつ表示
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE_OTHER_PAGES)
    for (let i = 0; i < totalPages; i++) {
      const start = i * ITEMS_PER_PAGE_OTHER_PAGES
      const end = start + ITEMS_PER_PAGE_OTHER_PAGES
      const itemsForPage = items.slice(start, end)
      const svg = await generateOrderInfoSvg(
        order,
        fontData,
        i + 1,
        itemsForPage
      )
      svgs.push(svg)
    }
  }
  return svgs
}
