# Security Policy

Japanese: [SECURITY.ja.md](./SECURITY.ja.md)

## Supported versions

Security fixes are provided for the latest **1.x** release published to [JSR](https://jsr.io/@wyrly) and [npm](https://www.npmjs.com/org/wyrly) (`@wyrly/*`).

Older major or minor lines may not receive patches unless noted in a security advisory.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report privately via one of:

- [GitHub Security Advisories](https://github.com/valid-lab/wyrly/security/advisories/new) (preferred)
- A private message to repository maintainers if you already have a contact channel

Include:

- Affected package(s) (`@wyrly/core`, adapters, etc.) and version
- Steps to reproduce
- Impact assessment (data exposure, RCE, denial of service, etc.)
- Suggested fix or mitigation if you have one

We aim to acknowledge reports within a few business days and will coordinate disclosure after a fix or mitigation is available.

## Scope

In scope:

- `@wyrly/*` packages in this repository (core and official adapters)
- Published artifacts on JSR and npm under the `@wyrly` scope

Out of scope:

- Vulnerabilities in downstream frameworks (Next.js, Express, Hono, etc.) unless directly caused by Wyrly adapter code
- Example applications under `examples/` unless the vulnerability is in reusable library code shipped to registries
