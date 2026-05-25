/** HTTP metadata on Apollo's `request` (subset used by Wyrly). */
export interface ApolloGraphQLHttpMetadata {
  /** HTTP method for the GraphQL operation. */
  method: string;
  /** Query string (e.g. `?query=...`). */
  search?: string;
  /** Header map with `get(name)`. */
  headers: {
    get(name: string): string | undefined;
  };
}

/**
 * Minimal Node/Express incoming HTTP request shape.
 * **Do not use in domain layer** — map to port tokens in `configureScope`.
 */
export interface ApolloHTTPRequestLike {
  /** HTTP method. */
  method?: string;
  /** Full URL or path + query (e.g. `/graphql` or `/graphql?op=1`). */
  url?: string;
  /** Header bag (plain object or `get(name)`). */
  headers?: Record<string, string | string[] | undefined> | {
    get?(name: string): string | undefined;
  };
  /** Express-style: original URL including mount path. */
  originalUrl?: string;
}

/**
 * Minimal Node HTTP response shape.
 * **Do not use in domain layer** — map to port tokens in `configureScope`.
 */
export interface ApolloHTTPResponseLike {
  /** Response status code when available. */
  statusCode?: number;
}

/**
 * Builds a Web API `Request` from Node-style HTTP metadata.
 * Pure helper for tests and Express / Apollo integrations.
 */
export function toFetchRequest(
  req: ApolloHTTPRequestLike,
  options: { baseUrl?: string } = {},
): Request {
  const base = options.baseUrl ?? "http://127.0.0.1";
  const rawUrl = req.url ?? req.originalUrl ?? "/graphql";
  const url = rawUrl.startsWith("http")
    ? rawUrl
    : `${base.replace(/\/$/, "")}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
  const headers = new Headers();
  const h = req.headers;
  if (h) {
    if (typeof h.get === "function") {
      for (
        const name of ["content-type", "content-length", "x-user-id", "authorization", "cookie"]
      ) {
        const value = h.get(name);
        if (value) headers.set(name, value);
      }
    } else {
      for (const [key, value] of Object.entries(h)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else {
          headers.set(key, value);
        }
      }
    }
  }
  return new Request(url, { method: req.method ?? "POST", headers });
}

/** Builds a `Request` from Apollo Server's per-operation HTTP metadata. */
export function requestFromApolloGraphQLRequest(
  http: ApolloGraphQLHttpMetadata | undefined,
  baseUrl = "http://127.0.0.1/graphql",
): Request {
  const search = http?.search ?? "";
  const url = new URL(search.startsWith("?") ? search : search ? `?${search}` : "", baseUrl);
  const headers = new Headers();
  if (http?.headers) {
    for (const name of ["content-type", "content-length", "x-user-id", "authorization", "cookie"]) {
      const value = http.headers.get(name);
      if (value) headers.set(name, value);
    }
  }
  return new Request(url, { method: http?.method ?? "POST", headers });
}
