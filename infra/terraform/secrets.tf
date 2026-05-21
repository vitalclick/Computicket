# Initial random values for the four "fail-loud" production secrets.
# The actual app-level rotation happens out-of-band — this just ensures
# nothing starts life as "dev_unsafe".
resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "random_password" "app_key" {
  length  = 48
  special = false
}

resource "random_password" "streaming_secret" {
  length  = 48
  special = false
}

resource "random_password" "nft_signing_key" {
  length  = 48
  special = false
}

# One Secrets Manager entry per logical secret. External Secrets
# Operator on EKS reads these and materialises k8s Secrets named
# `computicket-secrets` (see infra/k8s/base/secret.template.yaml).
resource "aws_secretsmanager_secret" "app" {
  name                    = "${local.name}/app-secrets"
  description             = "App-issued signing keys + the DATABASE_URL"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    JWT_SECRET       = random_password.jwt_secret.result
    APP_KEY          = random_password.app_key.result
    STREAMING_SECRET = random_password.streaming_secret.result
    NFT_SIGNING_KEY  = random_password.nft_signing_key.result
    DATABASE_URL = "postgresql://${aws_db_instance.main.username}:${urlencode(random_password.db_master.result)}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}?schema=public&sslmode=require"
  })

  lifecycle {
    # Operators rotate via the AWS console or the rotation Lambda;
    # ignore drift so Terraform doesn't claw it back.
    ignore_changes = [secret_string]
  }
}

# Partner secrets — values are populated out-of-band. Terraform just
# creates the slot with a placeholder so the JSON shape is fixed.
resource "aws_secretsmanager_secret" "partner" {
  name                    = "${local.name}/partner-secrets"
  description             = "Third-party API keys: Paystack, Postmark, Termii, Anthropic, Duffel, HotelBeds, Sentry"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "partner" {
  secret_id = aws_secretsmanager_secret.partner.id
  secret_string = jsonencode({
    PAYSTACK_SECRET_KEY  = "REPLACE_ME"
    PAYSTACK_PUBLIC_KEY  = "REPLACE_ME"
    POSTMARK_SERVER_TOKEN = "REPLACE_ME"
    TERMII_API_KEY       = "REPLACE_ME"
    ANTHROPIC_API_KEY    = ""
    DUFFEL_API_KEY       = ""
    HOTELBEDS_API_KEY    = ""
    HOTELBEDS_API_SECRET = ""
    SENTRY_DSN           = ""
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# IRSA role granting in-cluster `external-secrets-operator` read access
# to the two Secrets Manager entries. ESO's ExternalSecret resource
# then materialises them into the `computicket-secrets` k8s Secret.
data "aws_iam_policy_document" "external_secrets_read" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]
    resources = [
      aws_secretsmanager_secret.app.arn,
      aws_secretsmanager_secret.partner.arn,
    ]
  }
}

resource "aws_iam_policy" "external_secrets_read" {
  name        = "${local.name}-external-secrets-read"
  description = "Read-only access to Computicket secrets in Secrets Manager"
  policy      = data.aws_iam_policy_document.external_secrets_read.json
}

module "external_secrets_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name           = "${local.name}-external-secrets"
  role_policy_arns    = { read = aws_iam_policy.external_secrets_read.arn }
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["external-secrets:external-secrets"]
    }
  }
}
