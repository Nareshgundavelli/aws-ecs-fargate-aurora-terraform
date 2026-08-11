output "database_endpoint" {
  value = aws_rds_cluster.this.endpoint
}

output "database_reader_endpoint" {
  value = aws_rds_cluster.this.reader_endpoint
}

output "database_name" {
  value = aws_rds_cluster.this.database_name
}

output "database_username" {
  value = aws_rds_cluster.this.master_username
}

output "cluster_id" {
  value = aws_rds_cluster.this.cluster_identifier
}
