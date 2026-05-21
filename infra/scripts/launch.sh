#!/usr/bin/env bash
# launch.sh — one-shot bootstrap of an environment after `terraform
# apply`. Idempotent; safe to re-run for routine deploys.
#
# Steps it covers (matches docs/DEPLOY-WEB.md "order of operations"):
#   2.  kubeconfig + cluster reach
#   3.  Helm bootstrap: external-secrets + aws-load-balancer-controller
#       (IRSA-annotated from Terraform outputs)
#   4.  Build + push API and (optionally) web images to ECR
#   5.  kustomize edit set image → kubectl apply -k → wait for the
#       db-migrate Job → wait for the Deployments to roll out
#
# Steps it does NOT cover:
#   1.  `terraform apply` — review the plan separately, then run
#       this script. We refuse to apply Terraform from a launcher.
#   6.  Vercel project setup — that's documented in docs/DEPLOY-WEB.md.
#
# Usage:
#   infra/scripts/launch.sh [prod|staging]      # defaults to prod
#
# Env overrides:
#   TAG               image tag to build + deploy (defaults to git short SHA)
#   SKIP_WEB=1        skip pushing the web image (use this when web
#                     ships via Vercel and only the API container lives
#                     in EKS — that's our recommended split)
#   PLATFORM=...      docker build platform (default linux/amd64)
#   YES=1             skip the prod confirmation prompt
set -euo pipefail

ENV=${1:-prod}
if [[ "$ENV" != "prod" && "$ENV" != "staging" ]]; then
  echo "Usage: $0 [prod|staging]" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TF_DIR="$REPO_ROOT/infra/terraform"
K8S_OVERLAY="$REPO_ROOT/infra/k8s/overlays/$ENV"

TAG="${TAG:-$(cd "$REPO_ROOT" && git rev-parse --short HEAD)}"
PLATFORM="${PLATFORM:-linux/amd64}"
SKIP_WEB="${SKIP_WEB:-1}" # web ships via Vercel by default

# ---------- styling ----------
bold() { printf '\033[1m%s\033[0m\n' "$1"; }
say()  { printf '\033[1;36m▸\033[0m %s\n' "$1"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m⚠\033[0m %s\n' "$1"; }
fail() { printf '\033[1;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# ---------- pre-flight ----------
say "Pre-flight"
for cmd in aws kubectl helm docker terraform git jq; do
  command -v "$cmd" >/dev/null 2>&1 || fail "missing: $cmd"
done
docker info >/dev/null 2>&1 || fail "docker daemon not reachable"
aws sts get-caller-identity >/dev/null 2>&1 || fail "AWS credentials not loaded"
ok "tooling present, AWS creds loaded"

if [[ "$ENV" == "prod" && "${YES:-0}" != "1" ]]; then
  bold "Deploying to PRODUCTION."
  echo "Tag: $TAG"
  echo "Cluster: $(cd "$TF_DIR" && terraform output -raw eks_cluster_name 2>/dev/null || echo '<unknown>')"
  echo
  read -r -p "Type 'yes' to continue: " confirm
  [[ "$confirm" == "yes" ]] || fail "aborted"
fi

# ---------- Terraform outputs ----------
say "Reading Terraform outputs from $TF_DIR"
cd "$TF_DIR"
CLUSTER=$(terraform output -raw eks_cluster_name)
ECR_API=$(terraform output -json ecr_repository_urls | jq -r .api)
ECR_WEB=$(terraform output -json ecr_repository_urls | jq -r .web)
EXTERNAL_SECRETS_ROLE=$(terraform output -raw external_secrets_role_arn)
ALB_ROLE=$(terraform output -raw alb_controller_role_arn)
KUBECONFIG_CMD=$(terraform output -raw kubeconfig_command)
# Region inferred from the kubeconfig command — avoids adding another
# output that has to stay in sync with the provider config.
REGION=$(echo "$KUBECONFIG_CMD" | sed -n 's/.*--region \([a-z0-9-]*\).*/\1/p')
ok "cluster=$CLUSTER region=$REGION"

# ---------- Step 2: kubeconfig ----------
say "Updating kubeconfig"
eval "$KUBECONFIG_CMD"
kubectl get nodes >/dev/null || fail "kubectl can't reach the cluster"
ok "kubectl connected"

# ---------- Step 3: Helm bootstrap (idempotent) ----------
say "Bootstrapping platform Helm releases"
helm repo add eks https://aws.github.io/eks-charts >/dev/null 2>&1 || true
helm repo add external-secrets https://charts.external-secrets.io >/dev/null 2>&1 || true
helm repo update >/dev/null

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set "clusterName=$CLUSTER" \
  --set "serviceAccount.create=true" \
  --set "serviceAccount.name=aws-load-balancer-controller" \
  --set-string "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=$ALB_ROLE" \
  --wait
ok "aws-load-balancer-controller ready"

helm upgrade --install external-secrets external-secrets/external-secrets \
  -n external-secrets --create-namespace \
  --set "serviceAccount.create=true" \
  --set "serviceAccount.name=external-secrets" \
  --set-string "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=$EXTERNAL_SECRETS_ROLE" \
  --wait
ok "external-secrets-operator ready"

# Wait for the ESO CRDs to register. `kubectl apply -k` on the
# overlay fails noisily if SecretStore/ExternalSecret aren't known
# kinds yet.
for crd in secretstores.external-secrets.io externalsecrets.external-secrets.io; do
  for _ in $(seq 1 30); do
    kubectl get crd "$crd" >/dev/null 2>&1 && break
    sleep 2
  done
  kubectl get crd "$crd" >/dev/null 2>&1 || fail "CRD $crd not registered"
done
ok "ESO CRDs registered"

# ---------- Step 4: ECR login + build + push ----------
say "Logging in to ECR"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com" >/dev/null
ok "docker logged in to ECR"

say "Building + pushing API image ($ECR_API:$TAG)"
docker buildx build \
  --platform="$PLATFORM" \
  --push \
  -t "$ECR_API:$TAG" \
  -f "$REPO_ROOT/apps/api/Dockerfile" \
  "$REPO_ROOT"
ok "API image pushed"

if [[ "$SKIP_WEB" != "1" ]]; then
  say "Building + pushing web image ($ECR_WEB:$TAG)"
  docker buildx build \
    --platform="$PLATFORM" \
    --push \
    --build-arg "NEXT_PUBLIC_API_URL=https://api.$([ "$ENV" = "staging" ] && echo "staging." || echo "")computicket.ng/v1" \
    --build-arg "NEXT_PUBLIC_SITE_URL=https://$([ "$ENV" = "staging" ] && echo "staging." || echo "")computicket.ng" \
    -t "$ECR_WEB:$TAG" \
    -f "$REPO_ROOT/apps/web/Dockerfile" \
    "$REPO_ROOT"
  ok "web image pushed"
else
  warn "skipping web image (SKIP_WEB=1) — web ships via Vercel"
fi

# ---------- Step 5: render + apply manifests ----------
say "Rendering kustomize overlay with tag $TAG"
cd "$K8S_OVERLAY"
# The base manifests reference the GHCR placeholder names; rewrite
# them to point at ECR for this overlay.
kustomize edit set image \
  "ghcr.io/vitalclick/computicket-api=$ECR_API:$TAG" \
  "ghcr.io/vitalclick/computicket-web=$ECR_WEB:$TAG"
ok "image refs updated"

say "Applying manifests"
kubectl apply -k .
ok "manifests applied"

NAMESPACE="$ENV"
[[ "$ENV" == "staging" ]] && NAMESPACE="computicket-staging" || NAMESPACE="computicket"

say "Waiting for db-migrate Job to finish"
kubectl -n "$NAMESPACE" wait \
  --for=condition=complete \
  --timeout=10m \
  job/db-migrate || {
    echo "--- db-migrate logs ---"
    kubectl -n "$NAMESPACE" logs job/db-migrate || true
    fail "migrations did not complete"
  }
ok "db migrated"

say "Waiting for Deployments to roll out"
kubectl -n "$NAMESPACE" rollout status deploy/api --timeout=10m
[[ "$SKIP_WEB" != "1" ]] && kubectl -n "$NAMESPACE" rollout status deploy/web --timeout=10m
ok "Deployments live"

# ---------- Summary ----------
echo
bold "Done. ${ENV^} environment is live at:"
INGRESS_HOST=$(kubectl -n "$NAMESPACE" get ingress computicket \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
if [[ -n "$INGRESS_HOST" ]]; then
  echo "  ALB hostname: $INGRESS_HOST"
  echo "  Point Route 53 A/ALIAS records for api.${ENV/prod/}computicket.ng → $INGRESS_HOST"
else
  warn "Ingress hostname not yet provisioned — re-run \`kubectl -n $NAMESPACE get ingress computicket\` in a minute."
fi
echo "  API health: kubectl -n $NAMESPACE port-forward svc/api 4000:80 && curl localhost:4000/v1/health"
echo "  Audit log: kubectl -n $NAMESPACE logs deploy/api -f"
