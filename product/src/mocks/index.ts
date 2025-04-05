/**
 * API モックの初期化ファイル
 */

// window.mswの型定義
declare global {
	interface Window {
		msw?: unknown;
	}
}

// 開発環境でのみモックを有効化する
export const enableMocking = async () => {
	if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
		console.log('環境変数 NEXT_PUBLIC_API_MOCKING が "enabled" に設定されていないため、モックは無効です')
		return
	}

	// MSWのブラウザ設定を動的インポート
	const { worker } = await import('./browser')

	// モック未初期化の場合だけ開始
	if (!window.msw) {
		console.log('MSWサービスワーカーを初期化しています...')

		// モックを開始
		return worker.start({
			// モックによるログ出力を控えめにする
			quiet: process.env.NODE_ENV === 'test',
			// 404エラーが発生してもエラーにしない
			onUnhandledRequest: 'bypass'
		}).catch(error => {
			console.error('MSW初期化エラー:', error)
		})
	}

	return Promise.resolve()
} 