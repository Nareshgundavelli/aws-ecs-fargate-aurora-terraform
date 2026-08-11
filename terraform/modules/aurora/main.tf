# Aurora MySQL Cluster - Multi-AZ for High Availability
resource "aws_rds_cluster" "this" {
  cluster_identifier              = "${var.project_name}-${var.environment}-aurora"
  engine                          = "aurora-mysql"
  engine_version                  = "8.0.mysql_aurora.3.12.0"
  database_name                   = "cloudmart"
  master_username                 = var.database_username
  master_password                 = var.database_password
  backup_retention_period         = 7
  preferred_backup_window         = "03:00-04:00"
  preferred_maintenance_window    = "sun:04:00-sun:05:00"
  port                            = 3306
  vpc_security_group_ids          = var.security_group_ids
  db_subnet_group_name            = aws_db_subnet_group.this.name
  skip_final_snapshot             = true
  storage_encrypted               = true
  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]

  # Serverless v2 scaling (Aurora MySQL supported)
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora"
  }
}

# Writer instance (primary)
resource "aws_rds_cluster_instance" "this" {
  count              = 1
  identifier         = "${var.project_name}-${var.environment}-aurora-writer"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-writer"
  }
}

# Reader instance - provides Multi-AZ High Availability
resource "aws_rds_cluster_instance" "reader" {
  count              = 1
  identifier         = "${var.project_name}-${var.environment}-aurora-reader"
  cluster_identifier = aws_rds_cluster.this.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.this.engine
  engine_version     = aws_rds_cluster.this.engine_version

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-reader"
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-aurora-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-subnet-group"
  }
}
