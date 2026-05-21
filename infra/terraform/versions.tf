terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend is left configurable so different teams can use S3, Terraform
  # Cloud, or local state. Recommended for prod:
  #
  # backend "s3" {
  #   bucket         = "computicket-tfstate"
  #   key            = "prod/terraform.tfstate"
  #   region         = "eu-west-1"
  #   dynamodb_table = "computicket-tfstate-lock"
  #   encrypt        = true
  # }
}
