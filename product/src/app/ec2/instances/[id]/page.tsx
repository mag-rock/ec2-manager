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
			const response = await fetch(`/api/ec2/instances/${instanceId}`);
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
			const response = await fetch('/api/ec2/control', {
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

	// インスタンスの状態に応じた色を返す
	const getStateColor = (state: string) => {
		switch (state) {
			case 'running':
				return 'text-green-600';
			case 'stopped':
				return 'text-red-600';
			case 'pending':
			case 'stopping':
				return 'text-yellow-600';
			default:
				return 'text-gray-600';
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
						href="/ec2"
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
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<div className="p-6 border-b">
						<div className="flex flex-wrap justify-between mb-4">
							<div>
								<h2 className="text-xl font-semibold mb-1">
									{instance.tags?.Name || 'No Name'} ({instance.id})
								</h2>
								<p className="text-gray-600">{instance.type}</p>
							</div>
							<div className="flex items-center gap-2 mt-2 sm:mt-0">
								<span className={`font-semibold ${getStateColor(instance.state)}`}>
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
								<h3 className="text-lg font-semibold mb-2">基本情報</h3>
								<table className="w-full border-collapse">
									<tbody>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700 w-1/3">インスタンスID</td>
											<td className="py-2 font-mono">{instance.id}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">インスタンスタイプ</td>
											<td className="py-2">{instance.type}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">状態</td>
											<td className={`py-2 font-semibold ${getStateColor(instance.state)}`}>
												{getStateLabel(instance.state)}
											</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">パブリックIP</td>
											<td className="py-2 font-mono">{instance.publicIp || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">プライベートIP</td>
											<td className="py-2 font-mono">{instance.privateIp || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">起動時間</td>
											<td className="py-2">
												{instance.launchTime ? new Date(instance.launchTime).toLocaleString('ja-JP') : '-'}
											</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">ゾーン</td>
											<td className="py-2">{instance.availabilityZone || '-'}</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-2">ネットワーク・ストレージ</h3>
								<table className="w-full border-collapse">
									<tbody>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700 w-1/3">VPC ID</td>
											<td className="py-2 font-mono">{instance.vpcId || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">サブネット ID</td>
											<td className="py-2 font-mono">{instance.subnetId || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">AMI ID</td>
											<td className="py-2 font-mono">{instance.imageId || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">アーキテクチャ</td>
											<td className="py-2">{instance.architecture || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">ルートデバイス</td>
											<td className="py-2 font-mono">{instance.rootDeviceName || '-'}</td>
										</tr>
										<tr className="border-b">
											<td className="py-2 pr-4 font-medium text-gray-700">ステータスチェック</td>
											<td className="py-2">
												<div>システム: {instance.statusChecks?.systemStatus || '-'}</div>
												<div>インスタンス: {instance.statusChecks?.instanceStatus || '-'}</div>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						{instance.tags && Object.keys(instance.tags).length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-2">タグ</h3>
								<div className="bg-gray-50 p-4 rounded">
									{Object.entries(instance.tags).map(([key, value]) => (
										<div key={key} className="mb-1 flex">
											<span className="font-medium mr-2">{key}:</span>
											<span>{value || '-'}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{instance.securityGroups && instance.securityGroups.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-2">セキュリティグループ</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full border border-gray-200">
										<thead>
											<tr className="bg-gray-100">
												<th className="px-4 py-2 border text-left">ID</th>
												<th className="px-4 py-2 border text-left">名前</th>
											</tr>
										</thead>
										<tbody>
											{instance.securityGroups.map((sg) => (
												<tr key={sg.id} className="hover:bg-gray-50">
													<td className="px-4 py-2 border font-mono">{sg.id}</td>
													<td className="px-4 py-2 border">{sg.name}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{instance.blockDevices && instance.blockDevices.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-2">ブロックデバイス</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full border border-gray-200">
										<thead>
											<tr className="bg-gray-100">
												<th className="px-4 py-2 border text-left">デバイス名</th>
												<th className="px-4 py-2 border text-left">ボリュームID</th>
											</tr>
										</thead>
										<tbody>
											{instance.blockDevices.map((device) => (
												<tr key={device.deviceName} className="hover:bg-gray-50">
													<td className="px-4 py-2 border font-mono">{device.deviceName}</td>
													<td className="px-4 py-2 border font-mono">{device.volumeId}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
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