locals {
  # Common naming prefix
  name_prefix = "${var.project_name}-${var.environment}"

  # Global tags
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
