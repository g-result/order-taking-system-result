import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat' // カスタムフォーマットのためのプラグイン
import localizedFormat from 'dayjs/plugin/localizedFormat' // ローカライズフォーマットのためのプラグイン
import weekday from 'dayjs/plugin/weekday' // 曜日を表示するためのプラグイン
import 'dayjs/locale/ja' // 日本語ロケールをインポート

dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(weekday)
dayjs.locale('ja') // ロケールを日本語に設定

export default dayjs
