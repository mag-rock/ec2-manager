# EC2マネージャー

EC2インスタンスを効率的に管理するためのウェブアプリケーション。

## プロジェクト構成

```
ec2-manager/
├── product/               # アプリケーションのメインディレクトリ
│   ├── src/               # ソースコード
│   │   ├── app/           # Next.js アプリケーション
│   │   │   ├── page.tsx   # メインページ
│   │   │   ├── layout.tsx # レイアウトコンポーネント
│   │   │   └── globals.css # グローバルスタイル
│   │   │
│   │   └── server/        # Expressサーバー
│   │       └── index.ts   # サーバー設定
│   │
│   ├── public/            # 静的ファイル
│   │
│   ├── .next/             # Next.jsビルド出力
│   ├── node_modules/      # 依存パッケージ
│   │
│   ├── package.json       # プロジェクト設定・依存関係
│   ├── next.config.ts     # Next.js設定
│   ├── tsconfig.json      # TypeScript設定
│   └── postcss.config.mjs # PostCSS設定
│
├── plan/                  # 開発計画文書
│   └── development-plan.md # 開発計画詳細
│
└── doc/                   # ドキュメント
```

## 技術スタック

- **フロントエンド**: React/Next.js + TypeScript
- **スタイリング**: TailwindCSS
- **バックエンド**: Node.js/Express
- **AWS連携**: AWS SDK for JavaScript/TypeScript
- **コンテナ化**: Docker

## 主要機能

- EC2インスタンス一覧表示
- インスタンスの起動/停止操作
- インスタンス詳細情報の表示
- インスタンス状態のリアルタイム監視

## 実行環境

AWS ECS上で単一コンテナとして実行される設計。
IAMロールを使用してAWSリソースにアクセスします。 