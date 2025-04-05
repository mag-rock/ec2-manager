import { NextRequest, NextResponse } from 'next/server';
import {
	EC2Client,
	DescribeInstancesCommand,
	DescribeInstanceStatusCommand
} from '@aws-sdk/client-ec2';

// AWS SDKクライアントの初期化
const ec2Client = new EC2Client({
	region: process.env.AWS_REGION || 'ap-northeast-1',
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const instanceId = params.id;

		if (!instanceId) {
			return NextResponse.json(
				{ error: 'インスタンスIDが指定されていません' },
				{ status: 400 }
			);
		}

		// インスタンス詳細情報の取得
		const describeCommand = new DescribeInstancesCommand({
			InstanceIds: [instanceId]
		});

		const describeResponse = await ec2Client.send(describeCommand);

		if (!describeResponse.Reservations?.[0]?.Instances?.[0]) {
			return NextResponse.json(
				{ error: '指定されたインスタンスが見つかりません' },
				{ status: 404 }
			);
		}

		const instance = describeResponse.Reservations[0].Instances[0];

		// インスタンスのステータスチェック情報の取得
		const statusCommand = new DescribeInstanceStatusCommand({
			InstanceIds: [instanceId],
			IncludeAllInstances: true
		});

		const statusResponse = await ec2Client.send(statusCommand);
		const status = statusResponse.InstanceStatuses?.[0];

		// レスポンスデータの整形
		const instanceDetails = {
			id: instance.InstanceId,
			type: instance.InstanceType,
			state: instance.State?.Name,
			availabilityZone: instance.Placement?.AvailabilityZone,
			publicIp: instance.PublicIpAddress,
			privateIp: instance.PrivateIpAddress,
			vpcId: instance.VpcId,
			subnetId: instance.SubnetId,
			imageId: instance.ImageId,
			launchTime: instance.LaunchTime,
			architecture: instance.Architecture,
			rootDeviceType: instance.RootDeviceType,
			rootDeviceName: instance.RootDeviceName,
			securityGroups: instance.SecurityGroups?.map(sg => ({
				id: sg.GroupId,
				name: sg.GroupName
			})),
			blockDevices: instance.BlockDeviceMappings?.map(bdm => ({
				deviceName: bdm.DeviceName,
				volumeId: bdm.Ebs?.VolumeId
			})),
			tags: instance.Tags?.reduce((acc, tag) => {
				acc[tag.Key as string] = tag.Value;
				return acc;
			}, {} as Record<string, string | undefined>),
			statusChecks: {
				systemStatus: status?.SystemStatus?.Status,
				instanceStatus: status?.InstanceStatus?.Status
			}
		};

		return NextResponse.json({ instance: instanceDetails });
	} catch (error) {
		console.error('EC2インスタンス詳細取得エラー:', error);
		return NextResponse.json(
			{ error: 'EC2インスタンス詳細の取得に失敗しました' },
			{ status: 500 }
		);
	}
} 