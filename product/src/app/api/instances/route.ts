import { NextResponse } from 'next/server';
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

// AWS SDKクライアントの初期化
const ec2Client = new EC2Client({
	region: process.env.AWS_REGION || 'ap-northeast-1',
});

export async function GET() {
	try {
		// EC2インスタンス一覧を取得
		const command = new DescribeInstancesCommand({});
		const response = await ec2Client.send(command);

		// レスポンスデータを整形
		const instances = response.Reservations?.flatMap(reservation =>
			reservation.Instances?.map(instance => ({
				id: instance.InstanceId,
				type: instance.InstanceType,
				state: instance.State?.Name,
				publicIp: instance.PublicIpAddress,
				privateIp: instance.PrivateIpAddress,
				launchTime: instance.LaunchTime,
				tags: instance.Tags?.reduce((acc, tag) => {
					acc[tag.Key as string] = tag.Value;
					return acc;
				}, {} as Record<string, string | undefined>)
			})) || []
		) || [];

		return NextResponse.json({ instances });
	} catch (error) {
		console.error('EC2インスタンス一覧取得エラー:', error);
		return NextResponse.json(
			{ error: 'EC2インスタンス一覧の取得に失敗しました' },
			{ status: 500 }
		);
	}
} 