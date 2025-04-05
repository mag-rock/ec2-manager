import { NextRequest, NextResponse } from 'next/server';
import {
	EC2Client,
	StartInstancesCommand,
	StopInstancesCommand
} from '@aws-sdk/client-ec2';

// AWS SDKクライアントの初期化
const ec2Client = new EC2Client({
	region: process.env.AWS_REGION || 'ap-northeast-1',
});

export async function POST(request: NextRequest) {
	try {
		const { action, instanceIds } = await request.json();

		if (!action || !instanceIds || !Array.isArray(instanceIds) || instanceIds.length === 0) {
			return NextResponse.json(
				{ error: '無効なリクエストパラメータです' },
				{ status: 400 }
			);
		}

		let result;

		switch (action) {
			case 'start':
				const startCommand = new StartInstancesCommand({ InstanceIds: instanceIds });
				result = await ec2Client.send(startCommand);
				return NextResponse.json({
					message: 'インスタンスを起動しました',
					details: result.StartingInstances
				});

			case 'stop':
				const stopCommand = new StopInstancesCommand({ InstanceIds: instanceIds });
				result = await ec2Client.send(stopCommand);
				return NextResponse.json({
					message: 'インスタンスを停止しました',
					details: result.StoppingInstances
				});

			default:
				return NextResponse.json(
					{ error: '不明なアクション: ' + action },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('EC2インスタンス操作エラー:', error);
		return NextResponse.json(
			{ error: 'EC2インスタンスの操作に失敗しました' },
			{ status: 500 }
		);
	}
} 