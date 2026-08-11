# S3 bucket for product images
# Object Ownership = BucketOwnerEnforced (AWS best practice): ACLs are disabled
# entirely. Public read access is granted via a bucket policy (ACL-free) so
# images can be served directly to the browser.

resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name = var.bucket_name
  }
}

# Object Ownership = Bucket owner enforced.
# This disables ACLs at the bucket level (no ACLs can be set or used),
# which is the AWS recommended production setting.
resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Public Access Block:
# - block_public_acls / ignore_public_acls = true  -> ACLs stay blocked (no ACLs)
# - block_public_policy / restrict_public_buckets = false -> allows the
#   public-read GetObject bucket policy below to take effect.
# Depends on ownership controls so enforcement is applied first.
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false

  depends_on = [aws_s3_bucket_ownership_controls.this]
}

# Public-read bucket policy (ACL-free) so uploaded product images are
# accessible from the browser at their S3 URL. Only GET is allowed; no one
# can list or write via the internet.
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.this.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.this]
}

# Bucket versioning
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption (SSE-S3 AES256)
resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
