'use client';

import { useState } from 'react';
import Link from 'next/link';

// インスタンスの型定義
interface Instance {
	id: string;
	type: string;
	state: string;
	publicIp?: string;
	privateIp?: string;
	launchTime?: Date;
	tags?: Record<string, string | undefined>;
}

interface InstanceListProps {
	instances: Instance[];
	onRefresh: () => void;
}

export default function InstanceList({ instances, onRefresh }: InstanceListProps) {
	const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [actionMessage, setActionMessage] = useState('');
	const [actionError, setActionError] = useState('');

	// インスタンスの選択状態を切り替える
	const toggleInstanceSelection = (instanceId: string) => {
		setSelectedInstances(prev =>
			prev.includes(instanceId)
				? prev.filter(id => id !== instanceId)
				: [...prev, instanceId]
		);
	};

	// 全てのインスタンスの選択状態を切り替える
	const toggleAllInstances = () => {
		if (selectedInstances.length === instances.length) {
			setSelectedInstances([]);
		} else {
			setSelectedInstances(instances.map(instance => instance.id));
		}
	};

	// インスタンスを操作する関数
	const controlInstances = async (action: string) => {
		if (selectedInstances.length === 0) {
			setActionError('操作するインスタンスを選択してください');
			return;
		}

		try {
			setIsLoading(true);
			setActionMessage('');
			setActionError('');

			const response = await fetch('/api/control', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action,
					instanceIds: selectedInstances,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'インスタンス操作に失敗しました');
			}

			const data = await response.json();
			setActionMessage(data.message);
			setSelectedInstances([]);

			// 少し遅延させてから更新
			setTimeout(() => {
				onRefresh();
			}, 2000);

		} catch (err) {
			console.error('インスタンス操作エラー:', err);
			setActionError(err instanceof Error ? err.message : 'インスタンス操作中にエラーが発生しました');
		} finally {
			setIsLoading(false);
		}
	};

	// インスタンスの状態に応じたスタイルクラスを返す
	const getStateClasses = (state: string) => {
		switch (state) {
			case 'running':
				return 'bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium';
			case 'stopped':
				return 'bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium';
			case 'pending':
			case 'stopping':
				return 'bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium';
			default:
				return 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium';
		}
	};

	// インスタンスの日本語状態を返す
	const getStateLabel = (state: string) => {
		switch (state) {
			case 'running':
				return '実行中';
			case 'stopped':
				return '停止';
			case 'pending':
				return '起動中';
			case 'stopping':
				return '停止中';
			default:
				return state;
		}
	};

	return (
		<div>
			{(actionMessage || actionError) && (
				<div className={`mb-4 px-4 py-3 rounded ${actionError ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
					{actionError || actionMessage}
				</div>
			)}

			<div className="mb-4 flex gap-2">
				<button
					onClick={() => controlInstances('start')}
					disabled={isLoading || selectedInstances.length === 0}
					className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
				>
					起動
				</button>
				<button
					onClick={() => controlInstances('stop')}
					disabled={isLoading || selectedInstances.length === 0}
					className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
				>
					停止
				</button>
				{isLoading && (
					<span className="ml-2 inline-flex items-center">
						<div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
						処理中...
					</span>
				)}
			</div>

			{instances.length === 0 ? (
				<div className="text-center py-8 bg-gray-50 rounded">
					インスタンスがありません
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
						<thead>
							<tr className="bg-slate-100 border-b border-gray-300">
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<input
										type="checkbox"
										checked={selectedInstances.length === instances.length && instances.length > 0}
										onChange={toggleAllInstances}
										className="h-4 w-4"
									/>
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">パブリックIP</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">プライベートIP</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{instances.map((instance) => (
								<tr key={instance.id} className="hover:bg-slate-50">
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
										<input
											type="checkbox"
											checked={selectedInstances.includes(instance.id)}
											onChange={() => toggleInstanceSelection(instance.id)}
											className="h-4 w-4"
										/>
									</td>
									<td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-900">{instance.id}</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
										{instance.tags?.Name || '-'}
									</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{instance.type}</td>
									<td className="px-4 py-2 whitespace-nowrap">
										<span className={getStateClasses(instance.state)}>
											{getStateLabel(instance.state)}
										</span>
									</td>
									<td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-900">{instance.publicIp || '-'}</td>
									<td className="px-4 py-2 whitespace-nowrap font-mono text-sm text-gray-900">{instance.privateIp || '-'}</td>
									<td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
										<Link
											href={`/instances/${instance.id}`}
											className="text-blue-500 hover:text-blue-700 underline"
										>
											詳細
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
} 