output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnet_ids" {
  value = module.vpc.private_subnets
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_oidc_issuer_url" {
  value = module.eks.cluster_oidc_issuer_url
}

output "ecr_repository_urls" {
  value = { for k, r in aws_ecr_repository.main : k => r.repository_url }
}

output "rds_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}

output "secrets_manager_app_arn" {
  value = aws_secretsmanager_secret.app.arn
}

output "secrets_manager_partner_arn" {
  value = aws_secretsmanager_secret.partner.arn
}

output "acm_certificate_arn" {
  value = aws_acm_certificate_validation.main.certificate_arn
}

output "assets_bucket" {
  value = aws_s3_bucket.assets.bucket
}

output "external_secrets_role_arn" {
  description = "Annotate the external-secrets ServiceAccount with this to read Secrets Manager."
  value       = module.external_secrets_irsa.iam_role_arn
}

output "alb_controller_role_arn" {
  description = "Annotate the aws-load-balancer-controller ServiceAccount with this."
  value       = module.alb_controller_irsa.iam_role_arn
}

output "external_dns_role_arn" {
  description = "Annotate the external-dns ServiceAccount with this (optional)."
  value       = module.external_dns_irsa.iam_role_arn
}

output "api_assets_role_arn" {
  description = "Annotate the api ServiceAccount with this so the pod can presign S3 URLs."
  value       = module.api_assets_irsa.iam_role_arn
}

output "kubeconfig_command" {
  description = "Run this to talk to the cluster after apply."
  value       = "aws eks update-kubeconfig --region ${var.region} --name ${module.eks.cluster_name}"
}
