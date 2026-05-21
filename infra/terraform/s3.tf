# Private bucket for buyer-uploaded KYC documents + event covers.
# Reads are time-limited presigned URLs issued by the API.
resource "aws_s3_bucket" "assets" {
  bucket        = "${local.name}-assets"
  force_destroy = var.environment != "prod"
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  rule {
    id     = "expire-noncurrent"
    status = "Enabled"
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id
  cors_rule {
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# IRSA role for the API pod so it can issue presigned PUT/GET URLs
# without baking long-lived credentials into the container.
data "aws_iam_policy_document" "assets_rw" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.assets.arn,
      "${aws_s3_bucket.assets.arn}/*",
    ]
  }
}

resource "aws_iam_policy" "assets_rw" {
  name   = "${local.name}-assets-rw"
  policy = data.aws_iam_policy_document.assets_rw.json
}

module "api_assets_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name        = "${local.name}-api-assets"
  role_policy_arns = { assets = aws_iam_policy.assets_rw.arn }
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      # Namespace matches infra/k8s/overlays/{prod,staging}/namespace.yaml.
      namespace_service_accounts = ["${var.project}:api", "${var.project}-staging:api"]
    }
  }
}
