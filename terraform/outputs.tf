output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

output "ecr_frontend_url" {
  description = "URL of the frontend ECR repository"
  value       = module.ecr.frontend_repository_url
}

output "ecr_backend_url" {
  description = "URL of the backend ECR repository"
  value       = module.ecr.backend_repository_url
}

output "database_endpoint" {
  description = "Endpoint of the Aurora database"
  value       = module.aurora.database_endpoint
  sensitive   = true
}

output "s3_bucket" {
  description = "Name of the S3 bucket for product images"
  value       = module.s3.bucket_id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "cloudfront_url" {
  description = "CloudWatch dashboard URL"
  value       = module.cloudwatch.dashboard_name
}
