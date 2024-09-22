import { ApprovalStatus, RoleType } from '@prisma/client'

export const USERS = [
  {
    id: '60588f54-4a94-4568-92c1-9effed2c18b9',
    shopName: '魚屋本舗',
    businessType: '水産業',
    companyName: '株式会社魚市場',
    email: 'suzuki@uomaru.com',
    name: '鈴木 太郎',
    nameKana: 'スズキ タロウ',
    phoneNumber: '080-1234-5678',
    postalCode: '150-0001',
    prefecture: '東京都',
    city: '渋谷区',
    addressLine: '神宮前1丁目1-1',
    transferName: 'ウオマルホンポ',
    transferNameKana: 'ウオマルホンポ',
    roleType: RoleType.USER,
    approvalStatus: ApprovalStatus.APPROVED,
    lastLogin: new Date('2024-07-01T10:30:00Z')
  },
  {
    id: 'aa40324d-d597-4cdd-bd04-a93faf518fa1',
    shopName: '鮮魚亭',
    businessType: '水産業',
    companyName: '株式会社海鮮',
    email: 'tanaka@kaisen.com',
    name: '田中 花子',
    nameKana: 'タナカ ハナコ',
    phoneNumber: '090-9876-5432',
    postalCode: '530-0005',
    prefecture: '大阪府',
    city: '大阪市北区',
    addressLine: '梅田1丁目2-3',
    transferName: 'センギョテイ',
    transferNameKana: 'センギョテイ',
    roleType: RoleType.USER,
    approvalStatus: ApprovalStatus.APPLYING,
    lastLogin: new Date('2024-06-30T14:15:00Z')
  },
  {
    id: 'ac08cfec-7c6f-4218-9644-86a384d6200f',
    shopName: '浜辺の市場',
    businessType: '水産業',
    companyName: '株式会社波魚',
    email: 'yamada@namisakana.com',
    name: '山田 太一',
    nameKana: 'ヤマダ タイチ',
    phoneNumber: '070-8765-4321',
    postalCode: '460-0008',
    prefecture: '愛知県',
    city: '名古屋市中区',
    addressLine: '栄2丁目4-5',
    transferName: 'ハマベノイチバ',
    transferNameKana: 'ハマベノイチバ',
    roleType: RoleType.USER,
    approvalStatus: ApprovalStatus.APPROVED,
    lastLogin: new Date('2024-07-02T09:45:00Z')
  },
  {
    id: '30e156f0-897c-4ca6-a031-98d7b02f3c51',
    shopName: '魚市場',
    businessType: '水産業',
    companyName: '株式会社魚介',
    email: 'kato@gyokai.com',
    name: '加藤 和也',
    nameKana: 'カトウ カズヤ',
    phoneNumber: '090-7654-3210',
    postalCode: '604-8001',
    prefecture: '京都府',
    city: '京都市中京区',
    addressLine: '河原町三条1-1-1',
    transferName: 'ウオイチバ',
    transferNameKana: 'ウオイチバ',
    roleType: RoleType.USER,
    approvalStatus: ApprovalStatus.REJECTED,
    lastLogin: new Date('2024-06-29T11:20:00Z')
  }
]

export const MANGER_USER = {
  id: 'ca4b527e-4123-4ee3-a5f0-220c746f2f40',
  shopName: '管理者',
  email: 'admin@test.com',
  name: '日原 管理者',
  nameKana: 'ヒハラ カンリシャ',
  phoneNumber: '080-5678-1234',
  transferName: 'ヒハラカンリシャ',
  transferNameKana: 'ヒハラカンリシャ',
  roleType: RoleType.ADMIN,
  approvalStatus: ApprovalStatus.APPROVED
}

export const CATEGORIES_DATA = [
  { name: '青魚', color: '#0000FF', iconUrl: 'fish' },
  { name: '白身魚', color: '#FF00FF', iconUrl: 'pig' },
  { name: 'イカ・タコ', color: '#800080', iconUrl: 'plant' },
  { name: '甲殻類', color: '#FF0000', iconUrl: 'fish' },
  { name: '貝類', color: '#008000', iconUrl: 'pig' },
  { name: 'その他', color: '#FFA500', iconUrl: 'plant' }
]

export const TAGS_DATA = [
  { name: '新鮮' },
  { name: '旬' },
  { name: '限定' },
  { name: '特大' },
  { name: '高級' },
  { name: 'レア' }
]

export const RECOMMEND_TAGS_DATA = [
  { name: '刺身' },
  { name: '焼き物' },
  { name: '煮物' },
  { name: 'お寿司' },
  { name: 'サラダ' },
  { name: 'カルパッチョ' }
]
