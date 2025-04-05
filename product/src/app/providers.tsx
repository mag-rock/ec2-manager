'use client'

import { useEffect, useState } from 'react'

interface ProvidersProps {
	children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
	// MSWのモック初期化状態を管理
	const [isMockInitialized, setIsMockInitialized] = useState(false)

	useEffect(() => {
		// クライアントサイドの場合のみ実行
		if (typeof window !== 'undefined') {
			const initMocks = async () => {
				// 環境変数を直接チェック
				const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'
				console.log('APIモック状態:', isMockingEnabled ? '有効' : '無効')

				// モック機能が有効なら初期化
				if (isMockingEnabled) {
					try {
						// モック初期化ファイルを動的インポート
						const { enableMocking } = await import('../mocks')
						await enableMocking()
						console.log('APIモックを初期化しました ✅')
						setIsMockInitialized(true)
					} catch (error) {
						console.error('APIモックの初期化に失敗しました:', error)
						// エラーが発生しても続行（モックなしで実環境APIを使用）
						setIsMockInitialized(true)
					}
				} else {
					console.log('APIモックは無効です - 実際のAPIを使用します')
					// モック機能が無効な場合は初期化完了とみなす
					setIsMockInitialized(true)
				}
			}

			initMocks()
		}
	}, [])

	if (!isMockInitialized) {
		// モック初期化待ちの場合はローディング表示
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
				<p className="ml-3">APIモックを初期化中...</p>
			</div>
		)
	}

	return <>{children}</>
} 