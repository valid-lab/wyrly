import type { InjectionToken } from "./token.ts";
import type { ClassToken } from "./token.ts";
import type { Lifetime } from "./lifetime.ts";
import type { Provider } from "./provider.ts";
import type { NormalizedProvider } from "./provider.ts";
import { normalizeProvider, syntheticClassProvider } from "./provider.ts";
import type { Scope, ScopeDisposeOptions } from "./scope.ts";
import { getInjectableMetadata } from "./metadata.ts";
import { graphNodeId, type RegistryKey, registryKey } from "./internal_keys.ts";
import {
  CircularDependencyError,
  DuplicateProviderError,
  InvalidProviderError,
  LifetimeViolationError,
  ProviderNotFoundError,
  ScopeDisposedError,
  ScopeHasActiveChildrenError,
} from "./errors.ts";
import {
  augmentGraphWithInjectableClasses,
  buildGraph,
  collectRegisteredProviders,
  dedupeEdges,
  type DependencyGraph,
} from "./graph.ts";
import {
  validateNormalizedProviders,
  type ValidateOptions,
  type ValidationResult,
} from "./validate.ts";

/** Root DI container: registrations, root resolve, scopes, inspect, and validate. */
export interface Container {
  /** Registers a provider (or `@Injectable` class when `provider` is omitted). */
  register<T>(token: InjectionToken<T>, provider?: Provider<T>): void;
  /** Replaces an existing registration (tests and composition roots). */
  override<T>(token: InjectionToken<T>, provider: Provider<T>): void;
  /** Resolves from the root (singleton / transient only; not scoped). */
  resolve<T>(token: InjectionToken<T>): T;
  /** Creates a child scope (typically one per HTTP / GraphQL request). */
  createScope(): Scope;
  /** Exports the dependency graph for tooling and debugging. */
  inspect(): DependencyGraph;
  /** Runs design-time checks on the provider registry. */
  validate(options?: ValidateOptions): ValidationResult;
}

/** Creates a new root container with an empty provider registry. */
export function createContainer(): Container {
  return new ContainerImpl();
}

type Disposer = () => void | Promise<void>;

function pushDisposer(scope: ScopeImpl, disposer: Disposer): void {
  scope.disposers.push(disposer);
}

function maybeTrackDisposable(scope: ScopeImpl, instance: unknown): void {
  if (instance === null || instance === undefined) return;
  const t = typeof instance;
  if (t !== "object" && t !== "function") return;
  const o = instance as Record<PropertyKey, unknown>;
  if (typeof o[Symbol.dispose] === "function") {
    pushDisposer(scope, () => (o[Symbol.dispose] as () => void)());
    return;
  }
  if (typeof o.dispose === "function") {
    pushDisposer(scope, () => (o.dispose as () => void | Promise<void>)());
    return;
  }
  if (typeof o[Symbol.asyncDispose] === "function") {
    pushDisposer(scope, async () => {
      await (o[Symbol.asyncDispose] as () => Promise<void>)();
    });
  }
}

export class ScopeImpl implements Scope {
  readonly #container: ContainerImpl;
  readonly #allowsScoped: boolean;
  readonly #parent: ScopeImpl | undefined;
  readonly #children = new Set<ScopeImpl>();
  readonly #localValues = new Map<RegistryKey, unknown>();
  readonly #localProviders = new Map<RegistryKey, NormalizedProvider<unknown>>();
  readonly #scopedCache = new Map<RegistryKey, unknown>();
  readonly #resolvingStack: RegistryKey[] = [];
  disposers: Disposer[] = [];
  #disposed = false;

  constructor(
    container: ContainerImpl,
    options: { allowsScoped: boolean; parent?: ScopeImpl },
  ) {
    this.#container = container;
    this.#allowsScoped = options.allowsScoped;
    this.#parent = options.parent;
    if (this.#parent) {
      this.#parent.#children.add(this);
    }
  }

  getAllowsScoped(): boolean {
    return this.#allowsScoped;
  }

  isDisposed(): boolean {
    return this.#disposed;
  }

  resolve<T>(token: InjectionToken<T>): T {
    return this.#container.resolveFromScope(this, token, null, []);
  }

  register<T>(token: InjectionToken<T>, provider: Provider<T>): void {
    if (this.#disposed) throw new ScopeDisposedError();
    const key = registryKey(token);
    if (this.#localProviders.has(key)) {
      throw new DuplicateProviderError(token);
    }
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    this.#localProviders.set(key, np);
  }

  set<T>(token: InjectionToken<T>, value: T): void {
    if (this.#disposed) throw new ScopeDisposedError();
    this.#localValues.set(registryKey(token), value);
  }

  createChildScope(): Scope {
    if (this.#disposed) throw new ScopeDisposedError();
    if (!this.#allowsScoped) {
      throw new InvalidProviderError("InvalidProvider_child_scope_not_allowed");
    }
    return new ScopeImpl(this.#container, { allowsScoped: true, parent: this });
  }

  async dispose(options?: ScopeDisposeOptions): Promise<void> {
    if (this.#disposed) return;
    if (this.#children.size > 0) {
      throw new ScopeHasActiveChildrenError();
    }
    this.#disposed = true;
    if (this.#parent) {
      this.#parent.#children.delete(this);
    }
    const onError = options?.onError;
    for (let i = this.disposers.length - 1; i >= 0; i--) {
      try {
        await this.disposers[i]!();
      } catch (error) {
        onError?.(error);
      }
    }
    this.disposers.length = 0;
    this.#scopedCache.clear();
    this.#localProviders.clear();
    this.#localValues.clear();
  }

  findLocalValue(key: RegistryKey): unknown | undefined {
    if (this.#localValues.has(key)) {
      return this.#localValues.get(key);
    }
    return this.#parent?.findLocalValue(key);
  }

  hasLocalValue(key: RegistryKey): boolean {
    return this.findLocalValue(key) !== undefined;
  }

  getLocalValue(key: RegistryKey): unknown {
    return this.#localValues.get(key);
  }

  findLocalProvider(key: RegistryKey): NormalizedProvider<unknown> | undefined {
    const local = this.#localProviders.get(key);
    if (local !== undefined) return local;
    return this.#parent?.findLocalProvider(key);
  }

  getLocalProvider(key: RegistryKey): NormalizedProvider<unknown> | undefined {
    return this.#localProviders.get(key);
  }

  getScopedInChain(key: RegistryKey): unknown | undefined {
    const hit = this.#scopedCache.get(key);
    if (hit !== undefined) return hit;
    return this.#parent?.getScopedInChain(key);
  }

  getScoped(key: RegistryKey): unknown {
    return this.#scopedCache.get(key);
  }

  setScoped(key: RegistryKey, value: unknown): void {
    this.#scopedCache.set(key, value);
  }

  pushResolving(key: RegistryKey): void {
    this.#resolvingStack.push(key);
  }

  popResolving(): void {
    this.#resolvingStack.pop();
  }

  getResolvingStack(): readonly RegistryKey[] {
    return this.#resolvingStack;
  }
}

class ContainerImpl implements Container {
  readonly #registry = new Map<RegistryKey, NormalizedProvider<unknown>>();
  readonly #singletonCache = new Map<RegistryKey, unknown>();
  readonly #innerRootScope: ScopeImpl;

  constructor() {
    this.#innerRootScope = new ScopeImpl(this, { allowsScoped: false });
  }

  register<T>(token: InjectionToken<T>, provider?: Provider<T>): void {
    if (provider === undefined) {
      if (typeof token !== "function") {
        throw new InvalidProviderError("InvalidProvider_class_token_only");
      }
      const cls = token as ClassToken<T>;
      const meta = getInjectableMetadata(cls) ?? {};
      this.register(cls, {
        useClass: cls,
        deps: meta.deps ?? [],
        lifetime: meta.lifetime ?? "singleton",
      });
      return;
    }
    const key = registryKey(token);
    if (this.#registry.has(key)) {
      throw new DuplicateProviderError(token);
    }
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    this.#registry.set(key, np);
  }

  override<T>(token: InjectionToken<T>, provider: Provider<T>): void {
    const key = registryKey(token);
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    this.#registry.set(key, np);
    this.#singletonCache.delete(key);
  }

  resolve<T>(token: InjectionToken<T>): T {
    return this.#innerRootScope.resolve(token);
  }

  createScope(): Scope {
    return new ScopeImpl(this, { allowsScoped: true });
  }

  inspect(): DependencyGraph {
    const base = buildGraph(collectRegisteredProviders(this.#registry));
    const extra: InjectionToken<unknown>[] = [];
    for (const p of this.#registry.values()) {
      for (const d of p.deps) extra.push(d);
    }
    const graph = augmentGraphWithInjectableClasses(base, extra);
    return { nodes: graph.nodes, edges: dedupeEdges(graph.edges) };
  }

  validate(options?: ValidateOptions): ValidationResult {
    return validateNormalizedProviders(
      collectRegisteredProviders(this.#registry),
      options,
    );
  }

  getSingleton(key: RegistryKey): unknown {
    return this.#singletonCache.get(key);
  }

  setSingleton(key: RegistryKey, value: unknown): void {
    this.#singletonCache.set(key, value);
  }

  resolveFromScope<T>(
    scope: ScopeImpl,
    token: InjectionToken<T>,
    consumerLifetime: Lifetime | null,
    path: string[],
  ): T {
    if (scope.isDisposed()) throw new ScopeDisposedError();

    const key = registryKey(token);
    const pathIds = [...path, graphNodeId(token)];

    const localValue = scope.findLocalValue(key);
    if (localValue !== undefined) {
      return localValue as T;
    }

    const localProv = scope.findLocalProvider(key);
    const regProv = this.#registry.get(key);
    const np = localProv ??
      regProv ??
      (typeof token === "function" && getInjectableMetadata(token as ClassToken<unknown>)
        ? syntheticClassProvider(token as ClassToken<T>) as NormalizedProvider<unknown>
        : undefined);

    if (!np) {
      throw new ProviderNotFoundError(token, pathIds);
    }

    if (consumerLifetime === "singleton" && np.lifetime === "scoped") {
      throw new LifetimeViolationError("singleton", "scoped", pathIds);
    }

    if (!scope.getAllowsScoped() && np.lifetime === "scoped") {
      throw new InvalidProviderError("InvalidProvider_scoped_from_root");
    }

    const stack = scope.getResolvingStack();
    if (stack.includes(key)) {
      const cyclePath = [...stack.map((k) => graphNodeIdFromKey(k)), graphNodeId(token)];
      throw new CircularDependencyError(cyclePath);
    }

    scope.pushResolving(key);
    try {
      return this.#materialize(scope, np as NormalizedProvider<T>, pathIds);
    } finally {
      scope.popResolving();
    }
  }

  #materialize<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    pathIds: string[],
  ): T {
    const key = registryKey(np.token);

    if (np.lifetime === "singleton") {
      const hit = this.getSingleton(key);
      if (hit !== undefined) return hit as T;
      const created = this.#createInstance(scope, np, pathIds);
      this.setSingleton(key, created);
      return created;
    }

    if (np.lifetime === "scoped") {
      const hit = scope.getScopedInChain(key);
      if (hit !== undefined) return hit as T;
      const created = this.#createInstance(scope, np, pathIds);
      scope.setScoped(key, created);
      if (scope.getAllowsScoped()) {
        maybeTrackDisposable(scope, created);
      }
      return created;
    }

    const created = this.#createInstance(scope, np, pathIds);
    if (scope.getAllowsScoped()) {
      maybeTrackDisposable(scope, created);
    }
    return created;
  }

  #createInstance<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    pathIds: string[],
  ): T {
    const resolveDep = (dep: InjectionToken<unknown>) =>
      this.resolveFromScope(scope, dep, np.lifetime, pathIds);

    switch (np.providerType) {
      case "value":
        return np.useValue as T;

      case "existing": {
        const ex = np.useExisting!;
        return this.resolveFromScope(scope, ex, np.lifetime, pathIds) as T;
      }

      case "factory": {
        const args = np.deps.map((d) => resolveDep(d));
        return np.useFactory!(scope, ...args) as T;
      }

      case "class": {
        const Ctor = np.useClass!;
        const args = np.deps.map((d) => resolveDep(d)) as never[];
        const instance = new (Ctor as new (...args: never[]) => T)(...args);
        return instance;
      }

      default:
        throw new InvalidProviderError("InvalidProvider_unsupported_provider_type", {
          providerType: String(np.providerType),
        });
    }
  }
}

function graphNodeIdFromKey(key: RegistryKey): string {
  if (typeof key === "function") {
    return graphNodeId(key as InjectionToken<unknown>);
  }
  return `symbol:${String(key)}`;
}
