# CloudMart Infrastructure (Terraform)

This directory contains the Infrastructure-as-Code (IaC) for deploying the CloudMart application on AWS using ECS Fargate.

## Architecture

The infrastructure is composed of the following modules:

| Module              | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| `vpc`               | VPC, subnets, IGW, NAT gateways, route tables                   |
| `security_groups`   | ALB, frontend ECS, backend ECS, and Aurora security groups      |
| `iam`               | ECS task execution role, task role, CloudWatch role             |
| `ecr`               | Frontend and backend ECR repositories                           |
| `ecs`               | ECS cluster, task definitions, services, autoscaling            |
| `alb`               | Application Load Balancer, target groups, listeners             |
| `aurora`            | Aurora MySQL cluster, instances, subnet group                   |
| `s3`                | Product image bucket (BucketOwnerEnforced, public-read policy)  |
| `route53`           | Hosted zone and DNS records                                     |
| `cloudwatch`        | Log groups, metrics, alarms, dashboard                          |

## S3 Image Bucket (product images)

The S3 module is configured for public-read product images **without ACLs**:

- **Object Ownership = `BucketOwnerEnforced`** — ACLs are disabled entirely (AWS best practice).
- **Public Access Block**: `block_public_acls = true`, `ignore_public_acls = true`,
  `block_public_policy = false`, `restrict_public_buckets = false` — ACLs stay blocked,
  but a public-read bucket policy is allowed.
- **Bucket policy**: grants `s3:GetObject` to `*` on `arn:aws:s3:::bucket/*` so images are
  publicly readable in the browser via GET only.
- **Versioning** enabled and **server-side encryption (SSE-S3)** enabled.

The backend upload route (`backend/src/routes/upload.js`) must **not** pass `ACL: 'public-read'`.
Public read is provided by the bucket policy. The ECS task role (`iam` module) is scoped to the
exact bucket ARN and the `products/` prefix (`s3:GetObject`/`s3:PutObject` on
`arn:aws:s3:::bucket/products/*`, plus `s3:ListBucket` with a `s3:prefix` condition) so uploads
happen only from the backend ECS task (least privilege).

## Directory Layout

```
terraform/
├── provider.tf
├── versions.tf
├── variables.tf
├── locals.tf
├── outputs.tf
├── main.tf
├── dev.tfvars
├── staging.tfvars
├── terraform.tfvars.example
└── modules/
    ├── vpc/
    ├── security_groups/
    ├── iam/
    ├── ecr/
    ├── ecs/
    ├── alb/
    ├── aurora/
    ├── s3/
    ├── route53/
    └── cloudwatch/
```

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.3.0
- AWS CLI configured with credentials
- An S3 bucket and DynamoDB table for remote state (see `versions.tf`)

## Usage

### Initialize

```bash
cd terraform
terraform init
```

### Plan (dev)

```bash
terraform plan -var-file="dev.tfvars"
```

### Apply (dev)

```bash
terraform apply -var-file="dev.tfvars" -auto-approve
```

### Staging

```bash
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars" -auto-approve
```

### Destroy

```bash
terraform destroy -var-file="dev.tfvars"
```

## Outputs

Run `terraform output` to see the deployed resource endpoints (ALB DNS, ECR URLs, database endpoint, etc.).

## Remote State

Remote state is stored in S3 with DynamoDB locking. The bucket and table must be created before running `terraform init`:

```bash
aws s3api create-bucket --bucket cloudmart-terraform-state-us-east-1 --region us-east-1
aws dynamodb create-table --table-name cloudmart-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
