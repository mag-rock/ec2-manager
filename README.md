# EC2マネージャー

EC2インスタンスを効率的に管理するためのウェブアプリケーション。

## プロジェクト構成

```
ec2-manager/
├── .github/               # GitHub Actions ワークフロー
├── .vscode/               # VS Code 設定
├── doc/                   # ドキュメント
├── plan/                  # 開発計画文書
├── product/               # Next.js アプリケーションルート
│   ├── .next/             # Next.js ビルド成果物
│   ├── node_modules/      # npm パッケージ
│   ├── public/            # 静的ファイル (画像など)
│   ├── src/               # ソースコード
│   │   ├── app/           # Next.js App Router
│   │   │   ├── api/       # API Route Handlers (バックエンドロジック含む)
│   │   │   ├── components/ # UI コンポーネント
│   │   │   ├── lib/       # 共通ライブラリ、ヘルパー関数
│   │   │   ├── globals.css # グローバル CSS
│   │   │   ├── layout.tsx # ルートレイアウト
│   │   │   └── page.tsx   # トップページ
│   │   └── mocks/         # MSW (APIモック) 関連
│   ├── .env.local         # ローカル環境変数
│   ├── .gitignore         # Git 無視ファイル設定
│   ├── Dockerfile         # Docker イメージ定義
│   ├── next-env.d.ts      # Next.js 型定義
│   ├── next.config.ts     # Next.js 設定
│   ├── package.json       # Node.js プロジェクト設定
│   ├── bun.lockb          # Bun ロックファイル
│   ├── postcss.config.mjs # PostCSS 設定
│   ├── README.md          # アプリケーション README
│   └── tsconfig.json      # TypeScript 設定
├── .gitignore             # プロジェクトルート Git 無視設定
└── README.md              # プロジェクトルート README
```

## 技術スタック

- **フロントエンド**: React/Next.js + TypeScript
- **スタイリング**: TailwindCSS
- **バックエンド**: App Router
- **AWS連携**: AWS SDK for JavaScript/TypeScript
- **コンテナ化**: Docker

## 環境変数

ローカル開発時には `product/.env.local` ファイルを使用します。このファイルでAPIモックの有効/無効などを設定できます。

## Docker

`product/Dockerfile` にてコンテナイメージのビルド設定を行っています。開発環境や本番環境での実行に使用します。

## 主要機能

- EC2インスタンス一覧表示
- インスタンスの起動/停止操作
- インスタンス詳細情報の表示
- インスタンス状態のリアルタイム監視

## 実行環境

AWS ECS上で単一コンテナとして実行される設計。
IAMロールを使用してAWSリソースにアクセスします。 