# Contributing to Wyrly DI

Japanese: [CONTRIBUTING.ja.md](./CONTRIBUTING.ja.md)

Thank you for your interest in contributing to `@wyrly/*`.

## Prerequisites

- [Deno](https://deno.com/) **2.x**
- For the full CI gate locally: **Node.js 20+**, **npm**, and [Bun](https://bun.sh/) (runtime compat
  smoke tests)

## First-time setup

```sh
git clone https://github.com/valid-lab/wyrly.git
cd wyrly/oss
deno task setup:hooks   # optional: Lefthook pre-commit / pre-push
```

## Before opening a PR

1. Read [AGENT.md](./AGENT.md) for architecture and coding conventions.
2. Run checks:

```sh
deno task ci:deno    # fast: Deno workspace only
deno task ci         # full gate (same as GitHub Actions; needs Node + Bun)
```

DI performance benchmarks (local, not CI):

```sh
deno task build:npm:core   # first time only
deno task bench:di
```

See [guides/BENCHMARK.md](./guides/BENCHMARK.md).

3. Update [CHANGELOG.md](./CHANGELOG.md) under `[Unreleased]` when the change is user-visible.

## Pull requests

- Target the `main` branch.
- Keep changes focused; one logical change per PR when possible.
- Ensure the [CI workflow](.github/workflows/ci.yml) passes (`deno task ci` on the runner).
- Conventional Commits (`feat:`, `fix:`, `docs:`) are appreciated but not required.

## Dependabot

[`.github/dependabot.yml`](./.github/dependabot.yml) updates **GitHub Actions** only. `compat/` npm
manifests use `file:` paths to gitignored `packages/*/npm/` and are excluded from Dependabot scans.

If **Dependabot** workflows still fail on `path_dependencies_not_reachable`, disable **Dependabot
security updates** under repository **Settings → Advanced Security** (keep **Dependabot alerts**).
Bump `express`, `hono`, etc. in `compat/*/package.json` manually when alerts appear.

## Releases

Maintainers cut releases with git tags `vX.Y.Z` and [PUBLISHING.md](./PUBLISHING.md). Contributors
do not need to publish to JSR/npm.

## Questions

- Usage and design: [GitHub Discussions](https://github.com/valid-lab/wyrly/discussions) or issues
- Security: [SECURITY.md](./SECURITY.md)
