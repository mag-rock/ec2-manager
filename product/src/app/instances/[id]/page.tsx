'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface InstanceDetails {
	id: string;
	type: string;
	state: string;
	availabilityZone?: string;
	publicIp?: string;
	privateIp?: string;
	vpcId?: string;
	subnetId?: string;
	imageId?: string;
	launchTime?: string;
	architecture?: string;
	rootDeviceType?: string;
	rootDeviceName?: string;
	securityGroups?: { id: string; name: string }[];
	blockDevices?: { deviceName: string; volumeId: string }[];
	tags?: Record<string, string | undefined>;
	statusChecks?: {
		systemStatus?: string;
		instanceStatus?: string;
	};
}

export default function InstanceDetailsPage() {
	const params = useParams();
	const instanceId = params.id as string;

	const [loading, setLoading] = useState(true);
	const [instance, setInstance] = useState<InstanceDetails | null>(null);
	const [error, setError] = useState('');

	// インスタンス詳細情報を取得する関数
	const fetchInstanceDetails = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/instances/${instanceId}`);
			if (!response.ok) {
				throw new Error('インスタンス詳細の取得に失敗しました');
			}
			const data = await response.json();
			setInstance(data.instance);
			setError('');
		} catch (err) {
			console.error('インスタンス詳細取得エラー:', err);
			setError('インスタンス詳細の取得中にエラーが発生しました');
		} finally {
			setLoading(false);
		}
	}, [instanceId]);

	// インスタンスを制御する関数
	const controlInstance = async (action: string) => {
		try {
			setLoading(true);
			const response = await fetch('/api/control', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action,
					instanceIds: [instanceId],
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'インスタンス操作に失敗しました');
			}

			// 操作成功後、詳細情報を更新
			setTimeout(() => {
				fetchInstanceDetails();
			}, 2000);
		} catch (err) {
			console.error('インスタンス操作エラー:', err);
			setError(err instanceof Error ? err.message : 'インスタンス操作中にエラーが発生しました');
			setLoading(false);
		}
	};

	// 初回レンダリング時にインスタンス詳細を取得
	useEffect(() => {
		fetchInstanceDetails();
	}, [instanceId, fetchInstanceDetails]);

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
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-wrap justify-between items-center mb-6">
				<h1 className="text-2xl font-bold mb-2 sm:mb-0">インスタンス詳細</h1>
				<div className="flex gap-2">
					<button
						onClick={() => fetchInstanceDetails()}
						className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
						disabled={loading}
					>
						更新
					</button>
					<Link
						href="/"
						className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
					>
						一覧へ戻る
					</Link>
				</div>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			{loading && !instance ? (
				<div className="flex justify-center items-center min-h-[300px]">
					<div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
				</div>
			) : instance ? (
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<div className="flex flex-wrap justify-between items-start mb-4">
							<div>
								<h2 className="text-xl font-semibold mb-1 flex items-center">
									{instance.tags?.Name || 'No Name'}
									<span className="text-gray-500 font-mono text-sm ml-2">({instance.id})</span>
								</h2>
								<p className="text-sm text-gray-600">{instance.type}</p>
							</div>
							<div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
								<span className={getStateClasses(instance.state)}>
									{getStateLabel(instance.state)}
								</span>
								{instance.state === 'stopped' && (
									<button
										onClick={() => controlInstance('start')}
										className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded"
										disabled={loading}
									>
										起動
									</button>
								)}
								{instance.state === 'running' && (
									<button
										onClick={() => controlInstance('stop')}
										className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
										disabled={loading}
									>
										停止
									</button>
								)}
								{loading && (
									<div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-lg font-semibold mb-3 text-gray-800">基本情報</h3>
								<div className="overflow-hidden border border-gray-200 rounded-md">
									<table className="w-full text-sm">
										<tbody className="divide-y divide-gray-200">
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600 w-1/3">インスタンスID</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.id}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">インスタンスタイプ</td>
												<td className="px-4 py-2 text-gray-800">{instance.type}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">状態</td>
												<td className="px-4 py-2">
													<span className={getStateClasses(instance.state)}>
														{getStateLabel(instance.state)}
													</span>
												</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">パブリックIP</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.publicIp || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">プライベートIP</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.privateIp || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">起動時間</td>
												<td className="px-4 py-2 text-gray-800">
													{instance.launchTime ? new Date(instance.launchTime).toLocaleString('ja-JP') : '-'}
												</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">ゾーン</td>
												<td className="px-4 py-2 text-gray-800">{instance.availabilityZone || '-'}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-3 text-gray-800">ネットワーク・ストレージ</h3>
								<div className="overflow-hidden border border-gray-200 rounded-md">
									<table className="w-full text-sm">
										<tbody className="divide-y divide-gray-200">
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600 w-1/3">VPC ID</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.vpcId || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">サブネット ID</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.subnetId || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">AMI ID</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.imageId || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">アーキテクチャ</td>
												<td className="px-4 py-2 text-gray-800">{instance.architecture || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">ルートデバイス</td>
												<td className="px-4 py-2 font-mono text-gray-800">{instance.rootDeviceName || '-'}</td>
											</tr>
											<tr className="hover:bg-slate-50">
												<td className="px-4 py-2 font-medium text-gray-600">ステータスチェック</td>
												<td className="px-4 py-2 text-gray-800">
													<div>システム: {instance.statusChecks?.systemStatus || '-'}</div>
													<div>インスタンス: {instance.statusChecks?.instanceStatus || '-'}</div>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						{instance.tags && Object.keys(instance.tags).length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3 text-gray-800">タグ</h3>
								{instance.tags && Object.keys(instance.tags).length > 0 ? (
									<div className="overflow-hidden border border-gray-200 rounded-md">
										<table className="w-full text-sm">
											<tbody className="divide-y divide-gray-200">
												{Object.entries(instance.tags).map(([key, value]) => (
													<tr key={key} className="hover:bg-slate-50">
														<td className="px-4 py-2 font-medium text-gray-600 w-1/3">{key}</td>
														<td className="px-4 py-2 text-gray-800">{value || '-'}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="bg-gray-50 p-4 rounded">
										<p className="text-sm text-gray-600">タグが設定されていません</p>
									</div>
								)}
							</div>
						)}

						{instance.securityGroups && instance.securityGroups.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3 text-gray-800">セキュリティグループ</h3>
								{instance.securityGroups && instance.securityGroups.length > 0 ? (
									<div className="overflow-hidden border border-gray-200 rounded-md">
										<table className="w-full text-sm">
											<thead className="bg-slate-50">
												<tr>
													<th className="px-4 py-2 text-left font-medium text-gray-600 w-1/2">グループID</th>
													<th className="px-4 py-2 text-left font-medium text-gray-600 w-1/2">グループ名</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{instance.securityGroups.map((sg) => (
													<tr key={sg.id} className="hover:bg-slate-50">
														<td className="px-4 py-2 font-mono text-gray-800">{sg.id}</td>
														<td className="px-4 py-2 text-gray-800">{sg.name}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="bg-gray-50 p-4 rounded">
										<p className="text-sm text-gray-600">セキュリティグループが設定されていません</p>
									</div>
								)}
							</div>
						)}

						{instance.blockDevices && instance.blockDevices.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3 text-gray-800">ブロックデバイス</h3>
								{instance.blockDevices && instance.blockDevices.length > 0 ? (
									<div className="overflow-hidden border border-gray-200 rounded-md">
										<table className="w-full text-sm">
											<thead className="bg-slate-50">
												<tr>
													<th className="px-4 py-2 text-left font-medium text-gray-600 w-1/2">デバイス名</th>
													<th className="px-4 py-2 text-left font-medium text-gray-600 w-1/2">ボリュームID</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												{instance.blockDevices.map((bd) => (
													<tr key={bd.deviceName} className="hover:bg-slate-50">
														<td className="px-4 py-2 text-gray-800">{bd.deviceName}</td>
														<td className="px-4 py-2 font-mono text-gray-800">{bd.volumeId}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="bg-gray-50 p-4 rounded">
										<p className="text-sm text-gray-600">ブロックデバイスが設定されていません</p>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
					インスタンス情報が見つかりません
				</div>
			)}
		</div>
	);
} 