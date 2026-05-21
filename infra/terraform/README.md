# Terraform — AWS foundations

Provisions everything below the line that the k8s manifests in
`infra/k8s/` depend on:

| Resource | What |
|---|---|
| **VPC** | `/16` across 2 AZs; public + private subnets; single NAT in non-prod, NAT-per-AZ in prod; VPC flow logs to CloudWatch (90d) |
| **RDS Postgres 16** | `db.t4g.medium`, gp3 encrypted storage, multi-AZ in prod, 30-day backups, `rds.force_ssl=1`, `pg_trgm` preloaded, Performance Insights, enhanced monitoring |
| **EKS** | `1.31`, managed node group on `t3.medium` (autoscaling 2–10), KMS-encrypted secrets, control-plane audit + auth logs to CloudWatch (90d), IRSA roles for vpc-cni, ebs-csi, external-dns, alb-controller, external-secrets, and the API pod (S3 presign) |
| **ECR** | Immutable tags, scan-on-push, lifecycle keeps 50 tagged + expires untagged after 7d |
| **ACM cert** | Apex + `*.<domain>`, DNS-validated through the supplied Route53 zone |
| **Secrets Manager** | `<name>/app-secrets` (random JWT/APP/STREAMING/NFT keys + DATABASE_URL) and `<name>/partner-secrets` (Paystack, Postmark, Termii, Anthropic, Duffel, HotelBeds, Sentry placeholders); both wired to External Secrets Operator via IRSA |
| **S3 assets** | Private bucket, AES256 + versioning, lifecycle for noncurrent + multipart abort, CORS for the public web origin |

## Apply

```sh
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars  # fill in Route53 zone id
terraform init
terraform plan -out=tf.plan
terraform apply tf.plan
```

Run from a workstation or CI host that has AWS credentials with
permissions to create VPCs, RDS, EKS, IAM roles, ACM, Secrets Manager,
S3, and Route53 records.

## State

The `terraform { backend ... }` block is commented out in
`versions.tf`. For team use, enable the S3 backend:

```hcl
backend "s3" {
  bucket         = "computicket-tfstate"
  key            = "prod/terraform.tfstate"
  region         = "eu-west-1"
  dynamodb_table = "computicket-tfstate-lock"
  encrypt        = true
}
```

Create the bucket + DynamoDB lock table manually first (one-time
bootstrap; chicken-and-egg).

## After apply

```sh
# Talk to the cluster
$(terraform output -raw kubeconfig_command)

# Install platform add-ons via Helm. Each one uses an IRSA role
# whose ARN is in `terraform output`.
helm upgrade --install aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$(terraform output -raw eks_cluster_name) \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=$(terraform output -raw alb_controller_role_arn)

helm upgrade --install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets --create-namespace \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=$(terraform output -raw external_secrets_role_arn)

# Then apply the app manifests (see infra/k8s/README.md).
kubectl apply -k ../k8s/overlays/prod
```

## Cost levers

The defaults aim for "safe prod minimum, not yet load-tested". For
early traffic you can cut:

- `eks_node_instance_types = ["t4g.medium"]` (Graviton, ~20% cheaper)
- `eks_node_desired_size = 2`
- `rds_instance_class = "db.t4g.small"` if you're at very low QPS

The expensive items, in order: NAT gateway (~$30/mo per AZ in prod →
$60), RDS multi-AZ (~$70/mo at t4g.medium), EKS control plane ($73/mo
flat). A single-AZ staging is ~$150/mo total; prod with HA is ~$350+.

## What's NOT in here (out of scope, by design)

- **CloudFront / CDN** for `apps/web/public` — easy to add later;
  the `us_east_1` provider alias is already declared
- **WAF** rules — start in count mode after pentest findings
- **CI/CD pipeline** — Terraform doesn't run GitHub Actions for you
- **Backup vaults** beyond the default RDS automated backups —
  consider AWS Backup for cross-region copy on prod
- **Compliance attestations** — SOC 2 / NDPR DPIA artifacts live
  outside the IaC repo
