output "record_fqdn" {
  value = var.domain_name != "" ? aws_route53_record.this[0].fqdn : ""
}
