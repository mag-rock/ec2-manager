# ECSデプロイ手順

## 前提条件
- AWSアカウントと適切な権限
- AWS CLIのインストールと設定
- GitHubリポジトリの設定

## ECSクラスター作成
```bash
aws ecs create-cluster --cluster-name ec2-manager-cluster
```

## ECRリポジトリ作成
```bash
aws ecr create-repository --repository-name ec2-manager
```

## IAMロールの設定
1. ecsTaskExecutionRoleが存在しない場合は作成
2. `iam-policy.json`の内容を使用してEC2マネージャー用のタスクロールを作成

```bash
# タスク実行ロールの確認
aws iam get-role --role-name ecsTaskExecutionRole

# タスクロールの作成
aws iam create-role --role-name ec2-manager-task-role --assume-role-policy-document file://trust-policy.json
aws iam put-role-policy --role-name ec2-manager-task-role --policy-name ec2-manager-permissions --policy-document file://iam-policy.json
```

## ネットワーク設定
1. VPCとサブネットが必要
2. セキュリティグループの作成
```bash
aws ec2 create-security-group --group-name ec2-manager-sg --description "Security group for EC2 Manager" --vpc-id your-vpc-id
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxx --protocol tcp --port 3000 --cidr 0.0.0.0/0
```

## ロードバランサー設定（オプション）
```bash
# ターゲットグループ作成
aws elbv2 create-target-group --name ec2-manager-tg --protocol HTTP --port 3000 --vpc-id your-vpc-id --target-type ip --health-check-path / --health-check-interval-seconds 30

# ロードバランサー作成
aws elbv2 create-load-balancer --name ec2-manager-lb --subnets subnet-xxxx subnet-yyyy --security-groups sg-xxxxxxxx

# リスナー作成
aws elbv2 create-listener --load-balancer-arn loadbalancer-arn --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=targetgroup-arn
```

## CI/CD設定
1. GitHubリポジトリのSecretsに以下を設定
   - `AWS_ROLE_TO_ASSUME`: GitHub Actionsが引き受けるIAMロールのARN

## 手動デプロイ手順
1. タスク定義の登録
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

2. サービスの作成/更新
```bash
# 新規作成
aws ecs create-service --cli-input-json file://service-definition.json

# 更新
aws ecs update-service --cluster ec2-manager-cluster --service ec2-manager --task-definition ec2-manager:latest
```

## 環境変数の置換
デプロイ前に以下の変数をタスク定義・サービス定義ファイルで置換してください:
- `${AWS_ACCOUNT_ID}`: AWSアカウントID
- `${ECR_REPOSITORY_URI}`: ECRリポジトリURI
- `${AWS_REGION}`: AWSリージョン
- `${ECS_CLUSTER}`: ECSクラスター名
- `${TASK_DEFINITION_ARN}`: タスク定義ARN
- `${SUBNET_ID_1}`, `${SUBNET_ID_2}`: サブネットID
- `${SECURITY_GROUP_ID}`: セキュリティグループID
- `${TARGET_GROUP_ARN}`: ターゲットグループARN 