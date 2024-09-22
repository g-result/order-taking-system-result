import {
  PrismaClient,
  ProductUnitType,
  type RankEnum,
  ApprovalStatus,
  RoleType
} from '@prisma/client'
import dayjs from 'dayjs'
import {
  CATEGORIES_DATA,
  MANGER_USER,
  RECOMMEND_TAGS_DATA,
  TAGS_DATA,
  USERS
} from './dummyData'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (prisma) => {
    // カテゴリーデータの作成
    const categories = []
    for (const categoryData of CATEGORIES_DATA) {
      const category = await prisma.category.create({ data: categoryData })
      categories.push(category)
    }

    // タグデータの作成
    const tags = []
    for (const tagData of TAGS_DATA) {
      const tag = await prisma.tag.create({ data: tagData })
      tags.push(tag)
    }

    // おすすめ関連タグデータの作成
    const recommendTags = []
    for (const recommendTagData of RECOMMEND_TAGS_DATA) {
      const recommendTag = await prisma.recommendTag.create({
        data: recommendTagData
      })
      recommendTags.push(recommendTag)
    }

    // ユーザーデータの作成
    const users = []
    for (let i = 0; i < 10; i++) {
      // 10人のユーザーを作成
      const user = {
        id: `test${i}`,
        shopName: `テスト店舗${i}`,
        businessType: '水産業',
        companyName: `株式会社テスト${i}`,
        email: `user${i}@example.com`,
        name: `テストユーザー${i}`,
        nameKana: `テストユーザー${i}`,
        phoneNumber: `090-1234-567${i}`,
        postalCode: '123-4567',
        prefecture: i % 2 === 0 ? '京都府' : '大阪府',
        city: i % 2 === 0 ? '宮津市' : '高槻市',
        addressLine: 'その先住所',
        transferName: `テスト振込名義${i}`,
        transferNameKana: `テストフリコミメイギ${i}`,
        roleType: RoleType.USER,
        approvalStatus:
          i % 3 === 0
            ? ApprovalStatus.APPROVED
            : i % 3 === 1
              ? ApprovalStatus.APPLYING
              : ApprovalStatus.REJECTED,
        lastLogin: new Date()
      }
      users.push(user)
    }
    for (const userData of users) {
      await prisma.user.create({
        data: userData
      })
    }
    // ダミーアカウント作成
    for (const userData of USERS) {
      await prisma.user.create({
        data: userData
      })
    }

    // 商品データの作成
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5) + 1
      const isPublished = Math.random() < 0.5
      const separateBackBelly = Math.random() < 0.5
      const pricingType = i % 2 === 0 ? '魚' : 'その他'

      const product = await prisma.product.create({
        data: {
          name: `商品${i}`,
          description: `商品${i}の説明`,
          origin: `産地${i}`,
          unit: pricingType === '魚' ? 'キロ' : '個',
          isPublished: isPublished,
          rank: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i % 5] as RankEnum,
          isRecommended: i % 2 === 0,
          separateBackBelly: pricingType === '魚' ? separateBackBelly : false,
          pricingType: pricingType,
          categories: {
            create: [
              { category: { connect: { id: categories[0].id } } },
              { category: { connect: { id: categories[3].id } } },
              { category: { connect: { id: categories[randomNum].id } } }
            ]
          },
          tags: {
            create: [
              { tag: { connect: { id: tags[0].id } } },
              { tag: { connect: { id: tags[1].id } } }
            ]
          },
          recommendTags: {
            create: [
              { recommendTag: { connect: { id: recommendTags[0].id } } },
              { recommendTag: { connect: { id: recommendTags[1].id } } }
            ]
          },
          variants: {
            create:
              pricingType === '魚'
                ? [
                    {
                      salesFormat: '本',
                      unitType: ProductUnitType.WHOLE,
                      price: 1000 * i,
                      tax: 10,
                      quantity: 10 * i,
                      displayOrder: 1,
                      discountedPrice: Math.floor(
                        1000 * i * (0.7 + Math.random() * 0.2)
                      )
                    },
                    {
                      salesFormat: '本',
                      unitType: ProductUnitType.HALF_BODY,
                      price: 500 * i,
                      tax: 10,
                      quantity: 20 * i,
                      discountedPrice: Math.floor(
                        500 * i * (0.7 + Math.random() * 0.2)
                      )
                    },
                    ...(separateBackBelly
                      ? [
                          {
                            salesFormat: '本',
                            unitType: ProductUnitType.QUATER_BACK,
                            price: 250 * i,
                            tax: 10,
                            quantity: 20 * i,
                            discountedPrice: Math.floor(
                              250 * i * (0.7 + Math.random() * 0.2)
                            )
                          },
                          {
                            salesFormat: '本',
                            unitType: ProductUnitType.QUATER_BELLY,
                            price: 250 * i,
                            tax: 10,
                            quantity: 20 * i,
                            discountedPrice: Math.floor(
                              250 * i * (0.7 + Math.random() * 0.2)
                            )
                          }
                        ]
                      : [
                          {
                            salesFormat: '本',
                            unitType: ProductUnitType.QUATER_BACK,
                            price: 250 * i,
                            tax: 10,
                            quantity: 40 * i,
                            discountedPrice: Math.floor(
                              250 * i * (0.7 + Math.random() * 0.2)
                            )
                          }
                        ])
                  ]
                : [
                    {
                      salesFormat: '個',
                      unitType: ProductUnitType.WHOLE,
                      price: 500 * i,
                      tax: 10,
                      quantity: 20 * i,
                      displayOrder: 1,
                      discountedPrice: Math.floor(
                        500 * i * (0.7 + Math.random() * 0.2)
                      )
                    }
                  ]
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: isPublished ? new Date() : null,
          publishedEndAt: isPublished
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
            : null,
          deletedAt: null,
          totalStock: 100 * i
        }
      })
      console.log(`Created product: ${product.name} (${product.pricingType})`)
    }

    // 管理者ユーザーデータの作成
    const adminUser = await prisma.user.create({
      data: MANGER_USER
    })
    // 別のユーザーデータの作成
    const anotherUser = await prisma.user.create({
      data: {
        id: 'another-user-id',
        shopName: 'anotherUserShop',
        email: 'anotheruser@test.com',
        name: 'anotherテストユーザー',
        nameKana: 'アナザーテストユーザー',
        phoneNumber: '090-8765-4321',
        transferName: 'アナザーテスト振込名義',
        transferNameKana: 'アナザーテストフリコミメイギ',
        roleType: RoleType.USER,
        approvalStatus: ApprovalStatus.APPROVED
      }
    })

    // adminUserに紐づく注文データの作成
    const Orders = []
    const generateOrderData = (
      userId: string,
      orderNumber: string,
      orderDate: Date,
      isCancelled: boolean,
      itemCount: number
    ) => {
      const items = []
      for (let i = 0; i < itemCount; i++) {
        const pricingType = i % 2 === 0 ? '魚' : 'その他'
        items.push({
          productName: `商品${i}`,
          salesFormat: pricingType === '魚' ? '本' : '個',
          unitType:
            pricingType === '魚'
              ? [
                  ProductUnitType.WHOLE,
                  ProductUnitType.HALF_BODY,
                  ProductUnitType.QUATER_BACK,
                  ProductUnitType.QUATER_BELLY
                ][i % 4]
              : ProductUnitType.WHOLE,
          price: 5000 * (i + 1),
          quantity: 2 + i,
          pricingType: pricingType,
          separateBackBelly: pricingType === '魚' ? Math.random() < 0.5 : false,
          productUnit: pricingType === '魚' ? 'キロ' : '個'
        })
      }
      return {
        userId,
        totalAmount: items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        orderNumber,
        orderDate,
        orderQuantity: items.length,
        isCancelled,
        items
      }
    }

    // 昨日の注文データを追加
    const yesterday = dayjs().subtract(1, 'day')
    Orders.push(
      generateOrderData(
        adminUser.id,
        'YESTERDAY123',
        yesterday
          .hour(15)
          .minute(0)
          .second(0)
          .toDate(), // 昨日の15:00
        false,
        5
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'YESTERDAY456',
        yesterday
          .hour(18)
          .minute(0)
          .second(0)
          .toDate(), // 昨日の18:00
        false,
        10
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'YESTERDAY789',
        yesterday
          .hour(21)
          .minute(0)
          .second(0)
          .toDate(), // 昨日の21:00
        false,
        15
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'ADMIN789',
        new Date('2024-01-05T00:00:00Z'),
        false,
        21
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'ADMIN789',
        new Date('2024-01-05T00:00:00Z'),
        false,
        35
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'ADMIN789',
        new Date('2024-01-05T00:00:00Z'),
        false,
        40
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'ADMIN789',
        new Date('2024-01-05T00:00:00Z'),
        false,
        50
      )
    )
    Orders.push(
      generateOrderData(
        adminUser.id,
        'ADMIN789',
        new Date('2024-01-05T00:00:00Z'),
        false,
        60
      )
    )
    // anotherUserに紐づく注文データを追加
    Orders.push(
      generateOrderData(
        anotherUser.id,
        'ANOTHER_USER_ORDER',
        new Date(),
        false,
        3
      )
    )

    for (const orderData of Orders) {
      await prisma.order.create({
        data: {
          ...orderData,
          items: {
            create: orderData.items
          }
        }
      })
    }

    // for (const orderData of Orders) {
    //   await prisma.order.create({
    //     data: {
    //       ...orderData,
    //       items: {
    //         create: orderData.items
    //       }
    //     }
    //   })
    // }
    for (const orderData of Orders) {
      await prisma.order.create({
        data: {
          ...orderData,
          items: {
            create: orderData.items.map((item) => ({
              ...item,
              separateBackBelly: Math.random() < 0.5,
              productUnit: 'キロ'
            }))
          }
        }
      })
    }

    // ニュースデータの作成
    const newsData = []
    for (let i = 1; i <= 20; i++) {
      newsData.push({
        // id: i,
        title: `タイトルが入ります。${i}`,
        content: `今日のニュースです。${i}`,
        publishedAt: new Date(),
        publishedEndAt: new Date(new Date().setDate(new Date().getDate() + 7))
      })
    }

    const news = await prisma.news.createMany({
      data: newsData
    })
  })
}

await main()
  .then(async () => {
    console.log('seeded')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('error')
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

// const main2 = async () => {
//   // 管理者ユーザーデータの作成
//   const adminUser = await prisma.user.create({
//     data: MANGER_USER
//   })

//   for (const user of USERS) {
//     await prisma.user.create({
//       data: user
//     })
//   }
// }

// await main2()
//   .then(async () => {
//     console.log('seeded')
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error('error')
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })
