/**
 * このファイルはMSWのサービスワーカーを公開ディレクトリに初期化するためのものです
 * npm/bunスクリプトから実行します
 */

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execSync } from 'child_process'

// ESモジュールで__dirnameを使用するためのワークアラウンド
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// プロジェクトルートのpublicディレクトリへのパス
const publicDir = resolve(__dirname, '../../public')

console.log('MSWサービスワーカーの初期化を開始します...')
console.log(`サービスワーカーの出力先: ${publicDir}`)

// publicディレクトリが存在するか確認
if (!fs.existsSync(publicDir)) {
	console.log('publicディレクトリが存在しないため作成します')
	fs.mkdirSync(publicDir, { recursive: true })
}

try {
	// mswinitコマンドを実行してサービスワーカーを生成
	execSync(`npx msw init ${publicDir} --save`)
	console.log('MSWサービスワーカーが正常に初期化されました')
} catch (error) {
	console.error('MSWサービスワーカーの初期化に失敗しました:', error)
	process.exit(1)
} 