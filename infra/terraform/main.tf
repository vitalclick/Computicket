provider "aws" {
  region = var.region
  default_tags {
    tags = local.tags
  }
}

# us-east-1 alias is required for CloudFront-bound certs. We don't have
# CloudFront in scope, but keep the provider available so an asset CDN
# can be slotted in without re-plumbing.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = local.tags
  }
}

locals {
  name = "${var.project}-${var.environment}"
  tags = merge({
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }, var.tags)
}
