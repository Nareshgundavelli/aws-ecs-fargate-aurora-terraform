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

variable "alb_sg_name" {
  description = "Name of the ALB security group"
  type        = string
}

variable "ecs_sg_name" {
  description = "Name of the ECS security group"
  type        = string
}

variable "db_sg_name" {
  description = "Name of the database security group"
  type        = string
}
