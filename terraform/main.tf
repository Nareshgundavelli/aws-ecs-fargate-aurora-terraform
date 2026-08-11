module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "security_groups" {
  source = "./modules/security_groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  alb_sg_name  = "cloudmart-alb"
  ecs_sg_name  = "cloudmart-ecs"
  db_sg_name   = "cloudmart-db"
}

module "iam" {
  source = "./modules/iam"

  project_name   = var.project_name
  environment    = var.environment
  s3_bucket_arn  = module.s3.bucket_arn
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "s3" {
  source = "./modules/s3"

  bucket_name = var.s3_bucket_name
}

module "aurora" {
  source = "./modules/aurora"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  database_subnet_ids = module.vpc.database_subnet_ids
  security_group_ids  = [module.security_groups.db_sg_id]
  database_username   = var.database_username
  database_password   = var.database_password
}

module "ecs" {
  source = "./modules/ecs"

  project_name                  = var.project_name
  environment                   = var.environment
  vpc_id                        = module.vpc.vpc_id
  private_subnet_ids            = module.vpc.private_subnet_ids
  ecs_security_group_id         = module.security_groups.ecs_sg_id
  alb_security_group_id         = module.security_groups.alb_sg_id
  alb_target_group_arn          = module.alb.backend_target_group_arn
  alb_frontend_target_group_arn = module.alb.frontend_target_group_arn
  ecr_frontend_url              = module.ecr.frontend_repository_url
  ecr_backend_url               = module.ecr.backend_repository_url
  task_execution_role_arn       = module.iam.task_execution_role_arn
  task_role_arn                 = module.iam.task_role_arn
  database_endpoint             = module.aurora.database_endpoint
  database_name                 = module.aurora.database_name
  database_username             = module.aurora.database_username
  database_password             = var.database_password
  aws_region                    = var.aws_region
  s3_bucket_name                = module.s3.bucket_id
  ecs_task_cpu                  = var.ecs_task_cpu
  ecs_task_memory               = var.ecs_task_memory
  desired_capacity              = var.desired_capacity
  min_capacity                  = var.min_capacity
  max_capacity                  = var.max_capacity
}

module "alb" {
  source = "./modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  alb_security_group_id = module.security_groups.alb_sg_id
  enable_https          = var.domain_name != ""
}

module "route53" {
  source = "./modules/route53"

  project_name   = var.project_name
  environment    = var.environment
  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id
  alb_dns_name   = module.alb.alb_dns_name
  alb_zone_id    = module.alb.alb_zone_id
}

module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name             = var.project_name
  environment              = var.environment
  ecs_cluster_name         = module.ecs.cluster_name
  backend_service_name     = module.ecs.backend_service_name
  frontend_service_name    = module.ecs.frontend_service_name
  backend_target_group_arn = module.alb.backend_target_group_arn
  aurora_cluster_id        = module.aurora.cluster_id
}
