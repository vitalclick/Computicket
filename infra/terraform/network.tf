module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.13"

  name = "${local.name}-vpc"
  cidr = var.vpc_cidr
  azs  = var.availability_zones

  # /20 per subnet x 4 subnets (public+private across 2 AZs).
  public_subnets  = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 4, i)]
  private_subnets = [for i, az in var.availability_zones : cidrsubnet(var.vpc_cidr, 4, i + length(var.availability_zones))]

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Single NAT in non-prod to keep the bill down. In prod each AZ gets
  # its own NAT for HA.
  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "prod"
  one_nat_gateway_per_az = var.environment == "prod"

  # EKS needs these tags on subnets so the AWS Load Balancer Controller
  # can discover where to place ALBs/NLBs.
  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = 1
    "kubernetes.io/cluster/${local.name}-eks"   = "shared"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = 1
    "kubernetes.io/cluster/${local.name}-eks"   = "shared"
  }

  # VPC flow logs to CloudWatch are cheap insurance for incident
  # forensics — pentest will want them.
  enable_flow_log                                 = true
  create_flow_log_cloudwatch_iam_role             = true
  create_flow_log_cloudwatch_log_group            = true
  flow_log_cloudwatch_log_group_retention_in_days = 90
}
