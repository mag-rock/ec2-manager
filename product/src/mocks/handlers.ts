import { http, HttpResponse, delay } from 'msw'

// モックEC2インスタンスデータ
const mockInstances = [
	{
		id: 'i-1234567890abcdef0',
		type: 't2.micro',
		state: 'running',
		publicIp: '203.0.113.1',
		privateIp: '10.0.0.1',
		launchTime: '2023-01-01T00:00:00Z',
		tags: { Name: 'テスト用Webサーバー' }
	},
	{
		id: 'i-0987654321fedcba0',
		type: 't3.small',
		state: 'stopped',
		privateIp: '10.0.0.2',
		launchTime: '2023-01-02T00:00:00Z',
		tags: { Name: 'テスト用DBサーバー' }
	},
	{
		id: 'i-abcdef1234567890',
		type: 't3.medium',
		state: 'running',
		publicIp: '203.0.113.3',
		privateIp: '10.0.0.3',
		launchTime: '2023-01-03T00:00:00Z',
		tags: { Name: 'テスト用アプリサーバー' }
	},
	{
		id: 'i-fedcba0987654321',
		type: 't2.small',
		state: 'stopped',
		privateIp: '10.0.0.4',
		launchTime: '2023-01-04T00:00:00Z',
		tags: { Name: 'バッチ処理サーバー' }
	},
]

// インスタンス操作の状態を管理するオブジェクト
let instanceStates = mockInstances.reduce((acc, instance) => {
	acc[instance.id] = instance.state
	return acc
}, {} as Record<string, string>)

export const handlers = [
	// インスタンス一覧取得API
	http.get('/api/ec2/instances', async () => {
		// レスポンスに500msの遅延を追加して実際のAPIっぽくする
		await delay(500)

		// 最新の状態を反映したインスタンス一覧を返す
		const updatedInstances = mockInstances.map(instance => ({
			...instance,
			state: instanceStates[instance.id]
		}))

		return HttpResponse.json({ instances: updatedInstances })
	}),

	// インスタンス詳細取得API
	http.get('/api/ec2/instances/:id', async ({ params }) => {
		const { id } = params
		await delay(500)

		const instance = mockInstances.find(inst => inst.id === id)

		if (!instance) {
			return new HttpResponse(
				JSON.stringify({ error: '指定されたインスタンスが見つかりません' }),
				{ status: 404 }
			)
		}

		// 最新の状態を反映
		const currentState = instanceStates[instance.id]

		return HttpResponse.json({
			instance: {
				...instance,
				state: currentState,
				availabilityZone: 'ap-northeast-1a',
				vpcId: 'vpc-12345678',
				subnetId: 'subnet-12345678',
				imageId: 'ami-12345678',
				architecture: 'x86_64',
				rootDeviceType: 'ebs',
				rootDeviceName: '/dev/sda1',
				securityGroups: [
					{ id: 'sg-12345678', name: 'default' },
					{ id: 'sg-87654321', name: 'web-server' }
				],
				blockDevices: [
					{ deviceName: '/dev/sda1', volumeId: 'vol-12345678' },
					{ deviceName: '/dev/sdf', volumeId: 'vol-87654321' }
				],
				statusChecks: {
					systemStatus: currentState === 'running' ? 'ok' : 'not-applicable',
					instanceStatus: currentState === 'running' ? 'ok' : 'not-applicable'
				}
			}
		})
	}),

	// インスタンス操作API
	http.post('/api/ec2/control', async ({ request }) => {
		await delay(800)

		// リクエストボディをJSON形式で取得
		const body = await request.json() as { action?: string, instanceIds?: string[] }
		const { action, instanceIds } = body

		if (!action || !instanceIds || !Array.isArray(instanceIds)) {
			return new HttpResponse(
				JSON.stringify({ error: '無効なリクエストパラメータです' }),
				{ status: 400 }
			)
		}

		if (action === 'start') {
			// 対象インスタンスの状態を「起動中」に更新
			instanceIds.forEach(id => {
				if (instanceStates[id] === 'stopped') {
					instanceStates[id] = 'pending'

					// 2秒後に「実行中」に状態を変更
					setTimeout(() => {
						instanceStates[id] = 'running'
					}, 2000)
				}
			})

			return HttpResponse.json({
				message: 'インスタンスを起動しました',
				details: instanceIds.map(id => ({
					InstanceId: id,
					CurrentState: { Name: 'pending' },
					PreviousState: { Name: 'stopped' }
				}))
			})
		} else if (action === 'stop') {
			// 対象インスタンスの状態を「停止中」に更新
			instanceIds.forEach(id => {
				if (instanceStates[id] === 'running') {
					instanceStates[id] = 'stopping'

					// 2秒後に「停止」に状態を変更
					setTimeout(() => {
						instanceStates[id] = 'stopped'
					}, 2000)
				}
			})

			return HttpResponse.json({
				message: 'インスタンスを停止しました',
				details: instanceIds.map(id => ({
					InstanceId: id,
					CurrentState: { Name: 'stopping' },
					PreviousState: { Name: 'running' }
				}))
			})
		} else {
			return new HttpResponse(
				JSON.stringify({ error: '不明なアクション: ' + action }),
				{ status: 400 }
			)
		}
	})
] 