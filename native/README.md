# Expo
- [ビルド結果一覧](https://expo.dev/accounts/if-tech/projects/order-taking-system/builds)
- [プッシュ通知](https://docs.expo.dev/push-notifications/sending-notifications/)
- [Project Secret](https://expo.dev/accounts/if-tech/projects/order-taking-system/secrets)
- [プッシュ通知のモニタリング](https://expo.dev/accounts/if-tech/projects/order-taking-system/push-notifications)

- Firebase Project: [Order Taking System](https://console.firebase.google.com/u/0/project/order-taking-system-34c7a/settings/serviceaccounts/adminsdk)


# 初期設定
```bash
bun run dev # WebAPIを立ち上げておく
cd /native
bun run setup
# まずdevelopmentでビルドしてエミュレータを立ち上げる
bun run build-dev:android
bun run build-dev:ios

# 👆のビルドをもとにローカルでの開発を開始する
bun run start
```

# 開発
エミュレータを立ち上げてから、ios, android, webでの開発を行う
```bash
bun run start 

# 個別に実行する場合
bun run android
bun run ios
bun run web
```

# ビルド
基本的にEAS Buildを使う。

[ビルド結果からインストールする](https://expo.dev/accounts/if-tech/projects/order-taking-system/builds)

```bash
# production（本番環境）
bun run build:android
bun run build:ios

# preview（お客さんテスト用）
bun run build-preview:android
bun run build-preview:ios

# development（開発用）
bun run build-dev:android
bun run build-dev:ios
```

# リリース
## 共通
- ビルドファイルをダウンロードする

## iOS
- Apple Developer Accountを作る
- Xcodeをインストールする
- Apple Developer Programに登録する
- App Store Connectにログインする
- アプリを作成する
- アプリを公開する

## Android
- Google Play Consoleにログインする
- アプリを作成する
- アプリを公開する


# アーキテクチャ
- 型のみは`/native`外でも参照可能
  - 例：prismaの型を使う
  - 例：trpcクライアントの型を使う

## ディレクトリ構成
- `/app`：画面。expo-routerに従う
  https://docs.expo.dev/router/advanced/root-layout/

- `asset`: アイコンなどの画像やフォント
- `/components`：共通コンポーネント
- `/hooks`：カスタムフック
- `/lib`：ライブラリ
- `/const`: 定数

## プロジェクト共通部分
- GitHub Actions
- Biome
- tRPCの型
- Prismaの型

## 環境変数
`util/env.ts`で管理する

local: `.env`
development: `eas.json`
preview: `eas.json`
production: `eas.json`

# 技術選定・ドキュメント
- UI: [Native Base](https://nativebase.io/)
- ルーティング: [Expo Router](https://docs.expo.dev/router/navigating-pages/)
- APIクライアント: [trpc＆React Query](https://trpc.io/docs/client/react)
- Auth: [Supabase Auth](https://supabase.com/docs/guides/auth)
- フォーム:[react-hook-form](https://react-hook-form.com/get-started#Quickstart)
- バリデーション:[Zod](https://zenn.dev/fumito0808/articles/29ad3c1b51f8fe)

- [dayjs](https://zenn.dev/akkie1030/articles/javascript-dayjs): 日時操作


