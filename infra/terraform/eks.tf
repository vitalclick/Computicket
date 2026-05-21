module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.30"

  cluster_name    = "${local.name}-eks"
  cluster_version = var.eks_cluster_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # API endpoint exposed publicly for kubectl access but restricted by
  # the EKS access entries below. The control plane stays private to
  # the VPC for in-cluster service traffic.
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Encryption at rest for k8s secrets via KMS.
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks_secrets.arn
    resources        = ["secrets"]
  }

  # CloudWatch log groups for audit + authenticator. 90 days retention.
  cluster_enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  cloudwatch_log_group_retention_in_days = 90

  # Managed node group runs the app workloads. Spot would cut cost
  # further; sticking with on-demand for prod stability.
  eks_managed_node_groups = {
    main = {
      instance_types = var.eks_node_instance_types
      capacity_type  = "ON_DEMAND"
      min_size       = 2
      max_size       = var.eks_node_max_size
      desired_size   = var.eks_node_desired_size

      # Pods that need IMDS should go through IRSA — block IMDSv1 + force
      # hop limit so workloads can't impersonate the node role.
      metadata_options = {
        http_endpoint               = "enabled"
        http_tokens                 = "required"
        http_put_response_hop_limit = 1
      }
    }
  }

  # Cluster add-ons.
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent              = true
      service_account_role_arn = module.vpc_cni_irsa.iam_role_arn
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  # Access entries replace the legacy aws-auth ConfigMap. Grant the
  # current Terraform principal cluster admin so post-apply kubectl
  # works without a chicken-and-egg dance.
  enable_cluster_creator_admin_permissions = true

  tags = local.tags
}

resource "aws_kms_key" "eks_secrets" {
  description             = "${local.name}-eks-secrets"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}

# IRSA roles for the cluster add-ons that need AWS API access.
module "vpc_cni_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name                 = "${local.name}-vpc-cni"
  attach_vpc_cni_policy     = true
  vpc_cni_enable_ipv4       = true
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-node"]
    }
  }
}

module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name             = "${local.name}-ebs-csi"
  attach_ebs_csi_policy = true
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
}

# IRSA role for ExternalDNS (optional — manages Route53 records from
# Ingress annotations). Comment out if not using ExternalDNS.
module "external_dns_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name                       = "${local.name}-external-dns"
  attach_external_dns_policy      = true
  external_dns_hosted_zone_arns   = ["arn:aws:route53:::hostedzone/${var.route53_zone_id}"]
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:external-dns"]
    }
  }
}

# IRSA role for the AWS Load Balancer Controller (manages ALBs/NLBs
# from Ingress / Service resources).
module "alb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.44"
  role_name                              = "${local.name}-alb-controller"
  attach_load_balancer_controller_policy = true
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}
