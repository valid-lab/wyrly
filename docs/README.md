# Wyrly DI docs

This directory is the Mintlify documentation root for Wyrly DI.

The repository root stays the source for package code and package-level README files. This
directory is the public documentation site source that Mintlify syncs from GitHub.

## Public site

- Documentation: https://docs.wyrly.dev/

## Local preview

Run Mintlify from this directory:

```sh
cd docs
npx --yes mint dev
```

## Quality checks

```sh
cd docs
npx --yes mint validate
npx --yes mint broken-links --check-anchors
```

External link checking can be useful before release, but it may be slower and more network-sensitive:

```sh
cd docs
npx --yes mint broken-links --check-anchors --check-external
```

## Mintlify connection

In the Mintlify dashboard:

1. Connect the `valid-lab/wyrly` GitHub repository.
2. Set the docs directory to `docs`.
3. Set the production branch to `main`.
4. Enable preview deployments for pull requests.
5. Configure the public domain as `docs.wyrly.dev`.

## Content ownership

Update docs in the same pull request as user-facing behavior changes. This keeps examples,
configuration, and framework guidance aligned with the code.
