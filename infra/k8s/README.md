# Kubernetes deployment

Kustomize layout: a `base/` with the canonical resources and per-env
`overlays/` (`staging`, `prod`) that patch namespace, image tag,
replica counts, hostnames, and any env-specific config.

## Resources

| File | What |
|---|---|
| `configmap.yaml` | Non-secret env (`NODE_ENV`, public URLs, CORS allowlist, feature flags) |
| `secret.template.yaml` | Required secrets — never apply this verbatim; see *Secrets* below |
| `api.deployment.yaml`, `api.service.yaml`, `api.hpa.yaml` | NestJS API at `:4000`, exposed as `api` ClusterIP, autoscaled CPU 70% / memory 80% (2–20 pods) |
| `web.deployment.yaml`, `web.service.yaml`, `web.hpa.yaml` | Next.js standalone at `:3000`, `web` ClusterIP, autoscaled CPU 70% (2–10 pods) |
| `migrate.job.yaml` | Pre-rollout `prisma migrate deploy` |
| `ingress.yaml` | nginx-ingress with cert-manager + HSTS; routes `api.computicket.ng` → api, apex + `www` → web |
| `poddisruptionbudgets.yaml` | `minAvailable: 1` so node drains and autoscaler scale-downs are zero-downtime |

## Deploy

```sh
# Sanity-check the rendered output before touching the cluster.
kubectl kustomize infra/k8s/overlays/prod | less

# Set the image tag from your CI pipeline:
cd infra/k8s/overlays/prod
kustomize edit set image \
  ghcr.io/vitalclick/computicket-api=ghcr.io/vitalclick/computicket-api:$GIT_SHA \
  ghcr.io/vitalclick/computicket-web=ghcr.io/vitalclick/computicket-web:$GIT_SHA

# Apply.
kubectl apply -k infra/k8s/overlays/prod
kubectl -n computicket rollout status deploy/api deploy/web --timeout=5m
```

## Secrets

`secret.template.yaml` is a stub with `REPLACE_ME` placeholders. **Never
commit a populated copy.** Use one of:

1. **External Secrets Operator** (recommended on EKS — pulls from AWS
   Secrets Manager). Create an `ExternalSecret` that materialises a
   Secret named `computicket-secrets` with the same keys.
2. **Sealed Secrets** — generate per-cluster with
   `kubeseal --raw --from-file=- < value.txt`.
3. **HashiCorp Vault** with the agent injector.

### Generating new secrets

```sh
openssl rand -base64 48   # JWT_SECRET, APP_KEY, STREAMING_SECRET, NFT_SIGNING_KEY
```

All four must be set in production — `apps/api/src/main.ts`'s
`requireProductionSecrets()` will refuse to start without them.

## Hardening notes

- Containers run as non-root, `readOnlyRootFilesystem: true`, all
  capabilities dropped, `seccompProfile: RuntimeDefault`. `/tmp` is a
  small `emptyDir` for ephemeral writes (logs, temp files).
- Namespaces have Pod Security Standards `restricted` enforced.
- API liveness is `/v1/health` (no DB hit) so a transient DB blip
  doesn't restart pods; readiness is `/v1/ready` (DB hit) so the
  service is taken out of the LB rotation cleanly when the DB is
  unreachable.
- Rolling updates use `maxUnavailable: 0, maxSurge: 1` for true
  zero-downtime deploys, paired with PDBs that prevent simultaneous
  voluntary disruption.

## Switching cloud LBs

The default ingress targets nginx-ingress. For AWS ALB, swap the
`ingressClassName` to `alb` and add the standard
`alb.ingress.kubernetes.io/*` annotations (target-type=ip,
listen-ports, certificate-arn). For GKE, switch to `gce` and use a
Google-managed cert via the `networking.gke.io/managed-certificates`
annotation. The Service definitions don't change.
