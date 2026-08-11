# Fix Image Upload - S3 Public Read via Bucket Policy (IaC, no ACLs)

## Problem
Images upload to S3 but cannot be viewed (AccessDenied). The bucket blocks all public
access (Public Access Block = all true), no bucket policy exists, and the upload used
`ACL: 'public-read'` which fails under Object Ownership = Bucket owner enforced.

## Solution (Infrastructure-as-Code - fully applied via `terraform apply`)
1. Configure Object Ownership = BucketOwnerEnforced (disables ACLs) - AWS best practice.
2. Configure Public Access Block to allow a public-read bucket policy while still
   blocking ACLs.
3. Add a bucket policy granting `s3:GetObject` to `*` so images are publicly readable.
4. Scope the ECS task role to the exact bucket and `products/` prefix (least privilege).
5. Remove the ACL from the backend upload code (no longer needed / not allowed).

## Steps

### 1. Terraform S3 module (`terraform/modules/s3/main.tf`)
- [x] Add `aws_s3_bucket_ownership_controls` with `object_ownership = "BucketOwnerEnforced"`
- [x] Set Public Access Block: `block_public_acls=true`, `ignore_public_acls=true`,
      `block_public_policy=false`, `restrict_public_buckets=false`
- [x] Add `aws_s3_bucket_policy` granting `s3:GetObject` to `*` on `arn:aws:s3:::bucket/*`
- [x] Keep versioning + SSE-S3 (AES256) server-side encryption
- [x] Add `depends_on` to enforce ownership before public-access-block before policy

### 2. Terraform IAM module (`terraform/modules/iam/main.tf`, `variables.tf`)
- [x] Add `s3_bucket_arn` variable
- [x] Scope `s3:GetObject`/`s3:PutObject` to `${bucket_arn}/products/*` (least privilege)
- [x] Scope `s3:ListBucket` to the bucket ARN with `s3:prefix` = `products/*`
- [x] Keep secretsmanager/ssm permissions unchanged

### 3. Root wiring (`terraform/main.tf`)
- [x] Pass `module.s3.bucket_arn` into `module.iam`

### 4. Backend (`backend/src/routes/upload.js`)
- [x] Remove `ACL: 'public-read'` from `PutObjectCommand`
- [x] Add `CacheControl: 'public, max-age=31536000, immutable'`
- [x] Keep response `{ url, key }`

### 5. Validate & deploy
- [x] `terraform validate` passes
- [ ] `terraform apply` (automatically configures bucket policy, ownership, access block)
- [ ] Rebuild backend image, push to ECR, force new ECS deployment
- [ ] Verify image upload returns `{ url, key }` and image loads (no AccessDenied)

