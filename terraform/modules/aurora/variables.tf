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

variable "database_subnet_ids" {
  description = "List of database subnet IDs"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for the DB"
  type        = list(string)
}

variable "database_username" {
  description = "Database admin username"
  type        = string
}

variable "database_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}
