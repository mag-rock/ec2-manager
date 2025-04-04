'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiTestPage() {
	const [message, setMessage] = useState<string>('読み込み中...');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// APIを呼び出す
		fetch('/api/hello')
			.then(response => {
				if (!response.ok) {
					throw new Error(`ステータスコード: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				setMessage(data.message);
			})
			.catch(err => {
				setError(`APIの呼び出しに失敗しました: ${err.message}`);
			});
	}, []);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8">
			<div className="max-w-2xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
				<h1 className="text-2xl font-bold mb-6">APIテスト</h1>

				{error ? (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<p>{error}</p>
					</div>
				) : (
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
						<p>APIレスポンス: <strong>{message}</strong></p>
					</div>
				)}

				<div className="flex flex-col space-y-4">
					<button
						onClick={() => window.location.reload()}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						再読み込み
					</button>

					<Link href="/" className="text-blue-500 hover:underline mt-4">
						ホームに戻る
					</Link>
				</div>
			</div>
		</div>
	);
} 