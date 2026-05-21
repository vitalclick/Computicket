resource "random_password" "db_master" {
  length  = 32
  special = true
  # RDS rejects /, @, ", and spaces in the master password.
  override_special = "!#$%&*()-_=+[]{}<>?"
}

resource "aws_security_group" "rds" {
  name        = "${local.name}-rds"
  description = "Postgres ingress from EKS pods only"
  vpc_id      = module.vpc.vpc_id
}

# EKS pod CIDR (same as VPC private subnets) → 5432. Worker nodes share
# the VPC CIDR so this also covers any kubectl exec sessions from the
# control plane's managed endpoints.
resource "aws_security_group_rule" "rds_from_vpc" {
  type              = "ingress"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = [var.vpc_cidr]
  security_group_id = aws_security_group.rds.id
  description       = "Postgres from anywhere in the VPC"
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_parameter_group" "pg16" {
  name        = "${local.name}-pg16"
  family      = "postgres16"
  description = "Computicket Postgres 16 — pg_trgm + force SSL"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  parameter {
    # pg_trgm is used by the event-search trigram indexes.
    name         = "shared_preload_libraries"
    value        = "pg_stat_statements,pg_trgm"
    apply_method = "pending-reboot"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "${local.name}-pg"
  engine         = "postgres"
  engine_version = "16.4"
  instance_class = var.rds_instance_class

  allocated_storage     = var.rds_allocated_storage_gb
  max_allocated_storage = var.rds_max_allocated_storage_gb
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "computicket"
  username = "computicket"
  password = random_password.db_master.result
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.pg16.name
  publicly_accessible    = false

  # Prod gets multi-AZ; staging/dev save the cost.
  multi_az = var.environment == "prod"

  # 30-day retention satisfies NDPR. Daily backup window in low-traffic
  # hours (Lagos UTC+1: 02:00 UTC = 03:00 local). Maintenance Sunday.
  backup_retention_period   = var.rds_backup_retention_days
  backup_window             = "02:00-03:00"
  maintenance_window        = "sun:03:00-sun:05:00"
  delete_automated_backups  = false
  copy_tags_to_snapshot     = true
  deletion_protection       = var.environment == "prod"
  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${local.name}-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  performance_insights_enabled    = true
  performance_insights_retention_period = 7
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  auto_minor_version_upgrade      = true

  apply_immediately = false # roll changes in the maintenance window
}

# Enhanced monitoring needs its own IAM role.
data "aws_iam_policy_document" "rds_monitoring_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["monitoring.rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "rds_monitoring" {
  name               = "${local.name}-rds-monitoring"
  assume_role_policy = data.aws_iam_policy_document.rds_monitoring_assume.json
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
