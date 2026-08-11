variable "project_name" {
  description = "Base name for all resources"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB"
  type        = string
}

variable "alb_target_group_arn" {
  description = "ARN of the backend ALB target group"
  type        = string
}

variable "alb_frontend_target_group_arn" {
  description = "ARN of the frontend ALB target group"
  type        = string
}

variable "ecr_frontend_url" {
  description = "URL of the frontend ECR repository"
  type        = string
}

variable "ecr_backend_url" {
  description = "URL of the backend ECR repository"
  type        = string
}

variable "task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

variable "database_endpoint" {
  description = "Aurora database endpoint"
  type        = string
}

variable "database_name" {
  description = "Aurora database name"
  type        = string
}

variable "database_username" {
  description = "Aurora database username"
  type        = string
}

variable "database_password" {
  description = "Aurora database password"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for product images"
  type        = string
}

variable "ecs_task_cpu" {
  description = "CPU units for ECS tasks"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "Memory (MB) for ECS tasks"
  type        = number
  default     = 1024
}

variable "desired_capacity" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks"
  type        = number
  default     = 4
}
