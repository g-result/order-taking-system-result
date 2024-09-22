# 環境
- Production環境: http://yamaichi-j.net/
- Development環境:　https://stg-order-taking-system.vercel.app
- Local環境: http://localhost:3000

## インフラ
- Nextjs → Vercel
- DB → Vercel Postgres(Prisma)
- Auth → Supabase Auth
- Storage → Supabase Storage
- CI/CD → GitHub Actions

## ルール

|項目|ルール|例|
|:----|:----|:----|
|ブランチ名|<issue番号>-<ブランチの内容>|- #1-implement-score-management<br>- #2-create-avatar-screen<br>- #3-develop-questionnaire-function|
|commitメッセージ|<種類>: <変更内容> (#<issue番号>)|- feat: スコア管理機能を実装 (#1)<br>- fix: アバター画面のレイアウトを修正 (#2)<br>- docs: アンケート機能の仕様書を更新 (#3)|

### ブランチ名の命名ルール:

- 先頭に関連するIssue番号を付ける
- Issue番号の後にハイフン(-)を入れる
- ブランチの内容を簡潔に表す英語の単語やフレーズを使用する
- 単語間はハイフン(-)で区切る

### commitメッセージのルール:

1. 種類: commitの種類を表すプレフィックスを使用
- feat: 新機能の追加
- fix: バグ修正
- docs: ドキュメントの変更
- style: コードの書式や構造の変更（機能に影響しない）
- refactor: リファクタリング
- perf: パフォーマンス改善
- test: テストの追加や修正
- chore: ビルドプロセスや補助ツールの変更
2. 変更内容: 変更内容を簡潔に説明する英語の文章
3. Issue番号: 関連するIssue番号を括弧内に記載

## Getting Started
### 準備
1. リポジトリクローン → VS Codeで開く
```bash
# リポジトリクローン
git clone ~~~
cd ~~~

# リモートリポジトリ追加して、最新ブランチを取得
git remote add upstream https://github.com/if-tech-system/template-nextjs-native.git
git pull upstream main

# VS codeで開く
code .

# Nativeアプリが不要なら削除
rm -r ./native
```

2. Bunのインストール
```bash
# protoをインストール
curl -fsSL https://moonrepo.dev/install/proto.sh | bash
# .prototoolsファイルにpinされているバージョンのbunをインストール
proto install bun --pin
```

3. Vercel CLIのインストール
```bash
npm install -g vercel
```
参考：https://vercel.com/docs/cli

### 初期設定
初期設定のためのコマンドを実行する。
mainブランチをpullした場合もこれを実行するとリセットできる。

```bash
# 一気にセットアップする。
bun run setup

# 👆は以下のコマンドの集約
# 既存のnode_modulesがあれば消す
rimraf node_modules;
# Bunを最新にインストールする
bun upgrade
# .envファイルを作成
cp .env.example .env
# データベース作成&マイグレーション
bun run db:up && bun run db:migrate
# データベースに初期データを入れる
bun run db:seed

```

### ローカル環境で開発する。
```
bun dev
```
ローカル環境：[http://localhost:3000](http://localhost:3000)



# Deploy
## Vercelへのデプロイ
```bash
# 開発環境へのデプロイ
bun dev-deploy

# 本番環境へのデプロイ
bun prod-deploy
```

## Supabase
1. dev環境とprod環境でSupabaseプロジェクトを分けて作成する
2. Authenticationでメール認証やGoogle認証を有効にする
3. URLとKEYを、devは`.env`ファイルにコピペ、prodはVercelの環境変数に設定する


## Vercel 
### プロジェクト作成
1. Vercelにログイン
2. if-tech-customerにてプロジェクト作成
3. リポジトリを選択
4. 設定
  1. `Vercel` > `Settings` > `Environment Variables`にて.envをコピー
  2. `Vercel` > `Settings` > `Git`にてGitHub連携
5. ローカルで試しにデプロイ
```bash
bun run dev-deploy
```

### Postgresデータベース作成
1. 該当プロジェクトのStorageへ移動
  1. Vercelのプロジェクトページに移動 https://vercel.com/if-tech-customer
  2. 該当プロジェクト > Storageを選択
2. Create Databaseからデータベース作成
  1. シンガポールを選択(現状日本リージョンはない)
作成が完了するとプロジェクトのEnvironment Variablesにenvファイルの内容が自動で設定される。


## CI/CD
GitHub Actionsを利用してCI/CDを行う。
### CI: コミット時に品質チェック
  - Type: `bun run typecheck`
  - Lint: `bun run biome:check`
  - Format: `bun run biome:check`
  - Build: `bun run build`
  - 単体テスト: `bun run test`

### CD: Vercelへのデプロイ 
  - mainブランチプッシュはdevへデプロイ
  - releaseブランチプッシュでprodへデプロイ

### 初期設定
1. [ ] 手動デプロイ設定
```bash
bun run dev-deploy
```
`.vercel`ディレクトリが作成される。

2. [ ] 自動デプロイ設定
Project > Settings > Git
  1. GitHub連携を行う
  2. リポジトリを選択
  3. Production Branch: `release`に設定する。(事前に作らないとエラーになる)

https://vercel.com/if-app/template-nextjs/settings/git

もしくは、GitHub Actionsから自動デプロイ設定を行う。
GitHub > リポジトリ > Settings > Actions secrets and variablesにてVercelトークンの設定する。
- ORG_ID:`team_X0xeBgqRASts3wkAxQQAhTJe`（`.vercel/project.json`参照）
- PROJECT_ID: prj_~~~~~~~~~（`.vercel/project.json`参照）
- VERCEL_TOKEN: https://vercel.com/account/tokensでリポジトリ名-github作成


# アーキテクチャ
## 大枠
- webフロント: `/src`
- native: `/native`
- api: `/server`
- db: `/prisma`

## フォルダ構成
- `.github`：GitHub Actionsの設定
- `.vercel`：Vercelの設定
- `.vscode`：VS Codeの設定
- `/public`：静的ファイル
- `/@types`:d.tsファイル
- `/prisma`：Prismaのスキーマファイル
  - `schema.prisma`：データベースのスキーマファイル。
    `bun run db:migrate`でデータベースのマイグレーション
    `bun run db:generate`でPrismaの型ファイルを生成
  - `seed.ts`：データベースの初期データ。
    `bun run db:seed`で実行
- `/lib`：ライブラリ：初期化・設定してexportする
  - `/supabase`: Supabaseのフロント、サーバークライアント設定
  - `/trpc`: trpcのWeb、Native、サーバークライアント設定
- `/util`：便利な変数、関数
  - `env.ts`：環境変数
  - `index.ts`：便利な関数
- `/native`：ネイティブアプリプロジェクト
- `/src`：Webアプリのソースコード
  - `/app`: Nextjs App Routerのディレクトリ
    - `page.tsx`：ページ(サーバーコンポーネントのみ)
    - `layout.tsx`：レイアウト
    - `*/_components`：ページのみ使うコンポーネント(クライアントコンポーネントあり) 
      trpcコードがシンプルなので、集約したほうが見やすい。
      そのため、無理にhooksに分けなくて良い。
    - `*/hooks`：ページのみ使うカスタムフック（ロジックがでかい場合分離する）
    - `/api`：API関連:trpcを使うので、基本使わない。
      - `trpc/[trpc].ts`：trpcのエンドポイント
  - `/components`：複数ページで使うコンポーネント
  - `/const`：定数。アッパースネークケースで定義
    - `config.ts`：設定
    - `key.ts`：cookieやlocalStorageのキー
  - `/hooks`：複数ページで使うカスタムフック
  - `/test`：テストコードを集約
- `/server`：APIサーバー
  - `/router`：trpcのルーティング設定
    - `/[ドメインオブジェクト名].ts`：2~階層目ルーティング設定
      2階層以上細かく分けられるので、
      あまりファットコントローラー気にせずに、ここにロジックを入れて良い。
  - `/repository`：データベース操作オブジェクト
    - `[table名].ts`：テーブルごとにリポジトリを作成
  - `/middleware`：tRCPのミドルウェア
    - `auth.ts`：認証・認可ミドルウェア


# 技術選定

## ライブラリ
- [VS Code](https://code.visualstudio.com/): エディタ
- [Bun](): ランタイム・プロジェクト管理・テストツール
- [TypeScript](https://www.typescriptlang.org/): 型付け
- [React](https://ja.reactjs.org/): フロントエンドライブラリ
- [Next.js](https://nextjs.org/): Reactフレームワーク
- [trpc](https://trpc.io/): APIクライアント・サーバー
- [Prisma](https://www.prisma.io/): ORM
- [PostgreSQL](https://www.postgresql.org/): データベース
- [Vercel](https://vercel.com/): ホスティング
- [GitHub Actions](https://docs.github.com/ja/actions): CI/CD
- [Docker](https://www.docker.com/): コンテナ
- [Biome](https://biomejs.dev/ja/): フォーマット・Lint
- [Zod](https://zenn.dev/fumito0808/articles/29ad3c1b51f8fe): バリデーション
- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks): gitフック。Commit Push時にLint・Format・テスト実行
- [nextjs-routes](https://github.com/tatethurston/nextjs-routes): Next.jsのルーティング型安全
- [trpc＆React Query](https://trpc.io/docs/client/react):APIクライアント
- [Supabase Auth](https://supabase.com/docs/guides/auth): 認証
- [react-hook-form](https://react-hook-form.com/get-started#Quickstart): フォーム
- [mantine](https://ui.mantine.dev/): UIライブラリ
  - [UI集](https://ui.mantine.dev/)
- [dayjs](https://zenn.dev/akkie1030/articles/javascript-dayjs): 日時操作
- dotenv: 環境変数

### いれていないもの
- E2Eテスト


## VS Code拡張機能
- Code Spell Checker: スペルチェック
- Biome: フォーマット・Lint
- Todo Tree: TODOコメントを表示 `// TODO: explain` で表示
- GitLens: Gitの情報表示
- DotENV: .envファイルのシンタックスハイライト
- prisma: prisma.schemaのシンタックスハイライト
- Auto Rename Tag: 閉じタグを変更すると開始タグも変更される
- Docker: Dockerfileのシンタックスハイライトと補完。Dockerパネル追加。
- GitHub Copilot: AIコード補完
- GitHub Actions: GitHub Actionsのシンタックスハイライト
- Change Case: キャメルケース、スネークケース、パスカルケースなどの変換
  `Cmd + Shift + P`でコマンドパレットから`Change Case`と打って変換
- color-highlight: カラーコードをプレビュー


## tRPC
1. API設定：`/server/router.ts`にルーターとリクエスト/レスポンスの型を設定する。
2. クライアント設定：`/lib/trpc`にてクライアント設定
- tRPCのメソッド集：http://localhost:3000/api/trpc/panel

### 用途
- クライアントコンポーネントから叩く場合には`clientApi`を使う。
- Nativeアプリから叩く場合には`nativeApi`を使う。
- サーバーコンポーネントから叩く場合には`serverApi`を使う。
  - ※認証が必要なメソッドはgetIsLoggedInを使って認証を確認しないとページごとレンダリングエラーになる

# Auth
サーバーサイドで認証するため、Supabase認証サービスで認証し、SessionCookieを使ってサーバー側で認証する。

## 認証フロー
1. Supabase認証サービスにて認証してサーバーへ送信 `/src/hooks/supabaseAuth.ts signin()`
2. サーバーミドルウェアにて検証後、SessionCookieを発行 `/src/middleware.ts`
3. クライアントを使ってAPIを叩くときはセッションCookieを使ってサーバー認証 `/server/middleware/supabaseAuth.ts`
4. Supabaseログアウト時にページリロードしてセッションCookieを更新（削除） `/src/hooks/supabaseAuth.ts signout()`→`/src/middleware.ts`

## ユーザー新規登録
1. Supabase認証サービスにて新規登録
2. Supabase認証サービスのsessionCookieでサーバーサイド認証
3. Supabase認証サービスのsubをuserIdとしてユーザー情報を登録

## 管理者の新規登録
1. Supabase認証サービスにて手動で新規登録（auto confirmを使用）
2. DBに接続し、Adminテーブルに登録したemailアドレスとidと権限を登録する（そのほかアプリにおいて管理者に必要な情報があれば、追加する）
3. idについては、supabaseのuser情報で確認(id)を活用する
※middlewareで取得するuserIdがsupabaseのuserIdのため、DBにもsupabaseのuserIdを設定しておく

### テストアカウントのログイン情報　※テンプレの情報のため、アプリごとに設定必要
| 権限            |    id        | email                 |  password                  |
|----------------|---------------------------------------|---------------|-----------|
| スーパー管理者　　|"ca4b527e-4123-4ee3-a5f0-220c746f2f40" | admin@test.com| admintest |



## 認可フロー
1. クライアントがサーバーにリクエストを送信（SessionCookieを含む）
2. サーバーはSessionCookieを使って認証
3. SessionCookieからユーザー情報を取得して認可

### 認可ミドルウェア
| tRPCのProcedure        | 認証 | 説明                           |
|------------------|-------------------------|---------------------------------------|
| publicProcedure  | No                      | 認証不要 |
| userProcedure    | Yes                     | 自分自身の認可 |
| adminProcedure   | Yes                     | 管理ユーザーの認可 |

## レスポンシブデザインの設定
### Mantine UIブレークポイントの使用
このプロジェクトではレスポンシブデザインを実現するために、Mantine UIが提供するデフォルトのブレークポイントを採用する。

SPに適したスタイルは、xsブレークポイント（576px）を基準に設定する。

## コミュニケーションルール

仕様に関する質問については、該当するIssueのコメントに記載し、Slackにも連絡するようにする。
slackのメンションについては、質問をしたい人につける。

デザインについて、質問がある場合、Figmaにコメントを残した上で、Slackにて、質問を記載する
slackのメンションについては、質問をしたい人につける

## Vercel Cron Jobs

VercelのCronジョブは、特定の時間に特定のAPIエンドポイントを自動的に呼び出すために設定されています。以下は、各Cronジョブのパス、実行内容、および実行タイミングの詳細です。

### Cron ジョブ一覧

1. 注文履歴の削除

   - パス: `/api/cron/delete-old-orders`
   - 実行内容: 3ヶ月以上前の注文データをデータベースから削除。
   - 実行タイミング: 毎月1日のAM0時に実行される。

2. 注文履歴(CSV ファイル)の送信

   - パス: `/api/cron/send-order-summary`
   - 実行内容: 前日のPM15時から当日のAM8:59分までの注文履歴(CSV ファイル)をメールに添付して送信する。
   - 実行タイミング: 毎日AM9時に実行される。
   - 補足: cron jobはUTCを使用している為、日本時間の9時に実行するには、UTCの0時にスケジュールする必要がある。

3. お知らせ配信
   - パス: `/api/cron/check-announcements`
   - 実行内容: お知らせの公開が開始されると、push通知でアプリにメッセージを配信する
   - 実行タイミング: 毎分実行される。
