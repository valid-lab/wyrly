# dependency-graph

Inspect and validate the dependency graph. Exports `container` as a composition root.

Japanese: [README.ja.md](./README.ja.md)

## What you learn

- Graph nodes and edges from `inspect()`
- Export via `graphToMermaid` / `graphToDot` (from `@wyrly/core`)
- Validation issues (cycles, lifetime rules, unused providers)

## Run

```sh
deno task example:dependency-graph
```

Same example via the OSS validate task:

```sh
deno task validate:example
```

## Wyrly Pro CLI (optional)

The commercial **`wyrly`** CLI (`doctor`, `graph`, `validate --format json`, `generate`) lives in
the private **Wyrly Pro** repository. Point it at this example:

```sh
# from Wyrly Pro repo (../pro)
deno task wyrly graph -- --entry ../oss/examples/dependency-graph/main.ts --format mermaid
deno task wyrly validate -- --entry ../oss/examples/dependency-graph/main.ts
```

## See also

| Topic          | Example                                    |
| -------------- | ------------------------------------------ |
| HTTP + inspect | Adapter examples export `container`        |
| Providers      | [provider-patterns](../provider-patterns/) |
