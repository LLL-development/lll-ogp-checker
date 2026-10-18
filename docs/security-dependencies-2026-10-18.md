# Dependency security maintenance — 2026-10-18

This change refreshes supported dependency ranges and the reproducible lockfile. It adds no product behavior or UI changes. npm audit failed before the update and succeeds after a clean npm ci (Node 22.23.1).

| Package | Installed patched version(s) |
|---|---|
| undici | 7.29.1 |
| sharp | 0.35.5 |

## Baseline advisories

The following open GitHub Dependabot alerts were captured before this change. Package audit counts differ from advisory counts because several advisories affect one package.

| Alert | Package | Vulnerable range | First fixed version | Advisory |
|---|---|---|---|---|
| [#16](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/16) | undici | `>= 7.0.0, < 7.29.1` | 7.29.1 | [GHSA-8436-99hf-9mmv](https://github.com/advisories/GHSA-8436-99hf-9mmv) |
| [#15](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/15) | undici | `>= 7.0.0, < 7.29.1` | 7.29.1 | [GHSA-2jfj-6hjv-fm6j](https://github.com/advisories/GHSA-2jfj-6hjv-fm6j) |
| [#14](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/14) | undici | `>= 7.0.0, < 7.29.1` | 7.29.1 | [GHSA-r53p-7pc4-xj5r](https://github.com/advisories/GHSA-r53p-7pc4-xj5r) |
| [#11](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/11) | undici | `>= 7.1.0, < 7.29.1` | 7.29.1 | [GHSA-2gqq-gqf2-x968](https://github.com/advisories/GHSA-2gqq-gqf2-x968) |
| [#10](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/10) | undici | `>= 7.11.0, < 7.29.1` | 7.29.1 | [GHSA-pmjh-fq2x-6v4x](https://github.com/advisories/GHSA-pmjh-fq2x-6v4x) |
| [#8](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/8) | undici | `>= 7.24.1, < 7.29.1` | 7.29.1 | [GHSA-w293-vg96-wgc3](https://github.com/advisories/GHSA-w293-vg96-wgc3) |
| [#6](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/6) | sharp | `< 0.35.4` | 0.35.4 | [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) |
| [#5](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/5) | undici | `>= 7.0.0, < 7.29.0` | 7.29.0 | [GHSA-m8rv-5g2x-5cg5](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) |
| [#4](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/4) | undici | `>= 7.0.0, < 7.29.0` | 7.29.0 | [GHSA-v3r7-h72x-cjcm](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) |
| [#3](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/3) | undici | `>= 7.0.0, < 7.29.0` | 7.29.0 | [GHSA-jr45-8vmc-qm54](https://github.com/advisories/GHSA-jr45-8vmc-qm54) |
| [#2](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/2) | undici | `>= 7.0.0, < 7.29.0` | 7.29.0 | [GHSA-8xcm-r25x-g524](https://github.com/advisories/GHSA-8xcm-r25x-g524) |
| [#1](https://github.com/LLL-development/lll-ogp-checker/security/dependabot/1) | undici | `>= 7.0.0, < 7.29.0` | 7.29.0 | [GHSA-4cwx-7wf7-3272](https://github.com/advisories/GHSA-4cwx-7wf7-3272) |

## Verification and deployment

Wrangler is updated within major 4 to 4.151.1 in both package.json/lockfile and the existing deployment workflow, which previously installed vulnerable 4.114.0 separately. Wrangler requires Node 22+. Its normal upstream tree selects Miniflare5 beta; no override. Clean npm ci, npm audit=0, npm ls=0, TypeScript typecheck and Pages Functions build succeed. Local Pages runtime fetches Example Domain metadata and rejects missing/invalid/file-scheme/private-host inputs with 400. The existing npm test script is a placeholder that deliberately exits1; no application test suite exists.

README identifies https://lll-ogp-checker.pages.dev/. Existing main-push/manual workflow deploys public/ plus functions through Cloudflare Pages. Secret names: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID. No production write or deployment occurred for this PR.

## Limits and rollback

npm audit is a dependency advisory check, not a proof that all application security properties are correct. Dependabot alerts are expected to be recalculated after merge; this PR does not dismiss them. Revert this PR to restore the previous dependency tree/workflow configuration (which reintroduces the listed vulnerable versions). Production deployment and remote secret presence require separate verification after review and merge.
