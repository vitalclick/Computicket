variable "project" {
  description = "Project tag prefixed to all created resources."
  type        = string
  default     = "computicket"
}

variable "environment" {
  description = "Environment name (e.g. prod, staging). Used in tags + resource names."
  type        = string
  validation {
    condition     = contains(["prod", "staging", "dev"], var.environment)
    error_message = "environment must be one of: prod, staging, dev"
  }
}

variable "region" {
  description = "AWS region. eu-west-1 is the closest in-region for Lagos with full RDS multi-AZ + EKS support."
  type        = string
  default     = "eu-west-1"
}

variable "vpc_cidr" {
  description = "CIDR for the VPC. Each AZ takes a /20 public + /20 private."
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Two AZs minimum so RDS multi-AZ has somewhere to fail over to."
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "Need at least 2 AZs for multi-AZ RDS."
  }
}

variable "domain_name" {
  description = "Apex domain. ACM cert covers this plus *.<domain>."
  type        = string
  default     = "computicket.ng"
}

variable "route53_zone_id" {
  description = "Pre-existing Route53 hosted zone ID. Cert validation + ALB DNS records land here."
  type        = string
}

variable "eks_cluster_version" {
  description = "Kubernetes version pinned by EKS."
  type        = string
  default     = "1.31"
}

variable "eks_node_instance_types" {
  description = "Managed node group instance types."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_desired_size" {
  description = "Initial node count. The cluster autoscaler / Karpenter can grow beyond this."
  type        = number
  default     = 3
}

variable "eks_node_max_size" {
  description = "Hard ceiling on managed node group size."
  type        = number
  default     = 10
}

variable "rds_instance_class" {
  description = "RDS instance class. db.t4g.medium is enough for early traffic."
  type        = string
  default     = "db.t4g.medium"
}

variable "rds_allocated_storage_gb" {
  description = "Initial allocated storage (GB). Storage autoscaling raises this."
  type        = number
  default     = 50
}

variable "rds_max_allocated_storage_gb" {
  description = "Ceiling for storage autoscaling."
  type        = number
  default     = 500
}

variable "rds_backup_retention_days" {
  description = "Automated backup retention. NDPR-compliant value is 30 days."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Extra tags merged into every resource."
  type        = map(string)
  default     = {}
}
