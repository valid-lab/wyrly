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

function graphNodeIdFromKey(key: RegistryKey): string {
  if (typeof key === "function") {
    return graphNodeId(key as InjectionToken<unknown>);
  }
  return `symbol:${String(key)}`;
}

function pathIdsFromKeys(keys: readonly RegistryKey[]): string[] {
  const out = new Array<string>(keys.length);
  for (let i = 0; i < keys.length; i++) {
    out[i] = graphNodeIdFromKey(keys[i]!);
  }
  return out;
}

export class ScopeImpl implements Scope {
  readonly #container: ContainerImpl;
  readonly #allowsScoped: boolean;
  readonly #parent: ScopeImpl | undefined;
  readonly #isInnerRoot: boolean;
  #children: Set<ScopeImpl> | undefined;
  readonly #localValues = new Map<RegistryKey, unknown>();
  readonly #localProviders = new Map<RegistryKey, NormalizedProvider<unknown>>();
  readonly #scopedCache = new Map<RegistryKey, unknown>();
  #resolvingStack: RegistryKey[] | undefined;
  #resolvingKeys: Set<RegistryKey> | undefined;
  #bindingsEmpty = true;
  #scopedCacheEmpty = true;
  disposers: Disposer[] = [];
  #disposed = false;

  constructor(
    container: ContainerImpl,
    options: { allowsScoped: boolean; parent?: ScopeImpl; isInnerRoot?: boolean },
  ) {
    this.#container = container;
    this.#allowsScoped = options.allowsScoped;
    this.#parent = options.parent;
    this.#isInnerRoot = options.isInnerRoot ?? false;
    if (this.#parent) {
      this.#parent.#ensureChildren().add(this);
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
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    if (this.#localProviders.has(np.key)) {
      throw new DuplicateProviderError(token);
    }
    this.#localProviders.set(np.key, np);
    this.#bindingsEmpty = false;
  }

  set<T>(token: InjectionToken<T>, value: T): void {
    if (this.#disposed) throw new ScopeDisposedError();
    this.#localValues.set(registryKey(token), value);
    this.#bindingsEmpty = false;
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
    if ((this.#children?.size ?? 0) > 0) {
      throw new ScopeHasActiveChildrenError();
    }
    this.#disposed = true;
    if (this.#parent) {
      this.#parent.#children?.delete(this);
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
    this.#bindingsEmpty = true;
    this.#scopedCacheEmpty = true;
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
    this.#scopedCacheEmpty = false;
  }

  canUltraFastCache(): boolean {
    if (this.#isInnerRoot) return this.#bindingsEmpty;
    if (!this.#bindingsEmpty) return false;
    return this.#parent?.canUltraFastCache() ?? true;
  }

  hasScopedCacheInChain(): boolean {
    if (!this.#scopedCacheEmpty) return true;
    return this.#parent?.hasScopedCacheInChain() ?? false;
  }

  isResolving(key: RegistryKey): boolean {
    return this.#resolvingKeys?.has(key) ?? false;
  }

  pushResolving(key: RegistryKey): void {
    const resolving = this.#ensureResolving();
    resolving.stack.push(key);
    resolving.keys.add(key);
  }

  popResolving(): void {
    const stack = this.#resolvingStack;
    if (!stack) return;
    const key = stack.pop();
    if (key !== undefined) {
      this.#resolvingKeys?.delete(key);
    }
  }

  getResolvingStack(): readonly RegistryKey[] {
    return this.#resolvingStack ?? [];
  }

  #ensureChildren(): Set<ScopeImpl> {
    if (!this.#children) {
      this.#children = new Set();
    }
    return this.#children;
  }

  #ensureResolving(): { stack: RegistryKey[]; keys: Set<RegistryKey> } {
    if (!this.#resolvingStack) {
      this.#resolvingStack = [];
      this.#resolvingKeys = new Set();
    }
    return { stack: this.#resolvingStack, keys: this.#resolvingKeys! };
  }
}

class ContainerImpl implements Container {
  readonly #registry = new Map<RegistryKey, NormalizedProvider<unknown>>();
  readonly #singletonCache = new Map<RegistryKey, unknown>();
  readonly #innerRootScope: ScopeImpl;

  constructor() {
    this.#innerRootScope = new ScopeImpl(this, { allowsScoped: false, isInnerRoot: true });
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
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    if (this.#registry.has(np.key)) {
      throw new DuplicateProviderError(token);
    }
    this.#registry.set(np.key, np);
  }

  override<T>(token: InjectionToken<T>, provider: Provider<T>): void {
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    this.#registry.set(np.key, np);
    this.#singletonCache.delete(np.key);
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

  #tryUltraFastCache<T>(scope: ScopeImpl, key: RegistryKey): T | undefined {
    if (!scope.canUltraFastCache()) return undefined;
    const singletonHit = this.#singletonCache.get(key);
    if (singletonHit !== undefined) return singletonHit as T;
    if (scope.getAllowsScoped() && scope.hasScopedCacheInChain()) {
      const scopedHit = scope.getScopedInChain(key);
      if (scopedHit !== undefined) return scopedHit as T;
    }
    return undefined;
  }

  resolveFromScope<T>(
    scope: ScopeImpl,
    token: InjectionToken<T>,
    consumerLifetime: Lifetime | null,
    resolvingPath: RegistryKey[],
  ): T {
    if (scope.isDisposed()) throw new ScopeDisposedError();

    const key = registryKey(token);

    const ultraFast = this.#tryUltraFastCache<T>(scope, key);
    if (ultraFast !== undefined) return ultraFast;

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
      throw new ProviderNotFoundError(token, pathIdsFromKeys([...resolvingPath, key]));
    }

    if (consumerLifetime === "singleton" && np.lifetime === "scoped") {
      throw new LifetimeViolationError(
        "singleton",
        "scoped",
        pathIdsFromKeys([...resolvingPath, key]),
      );
    }

    if (!scope.getAllowsScoped() && np.lifetime === "scoped") {
      throw new InvalidProviderError("InvalidProvider_scoped_from_root");
    }

    if (np.lifetime === "singleton") {
      const hit = this.#singletonCache.get(np.key);
      if (hit !== undefined) return hit as T;
    } else if (np.lifetime === "scoped") {
      const hit = scope.getScopedInChain(np.key);
      if (hit !== undefined) return hit as T;
    }

    if (scope.isResolving(key)) {
      const cyclePath = pathIdsFromKeys([...scope.getResolvingStack(), key]);
      throw new CircularDependencyError(cyclePath);
    }

    const pathWithSelf = [...resolvingPath, key];
    scope.pushResolving(key);
    try {
      return this.#materialize(scope, np as NormalizedProvider<T>, pathWithSelf);
    } finally {
      scope.popResolving();
    }
  }

  #materialize<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    resolvingPath: RegistryKey[],
  ): T {
    const key = np.key;

    if (np.lifetime === "singleton") {
      const hit = this.#singletonCache.get(key);
      if (hit !== undefined) return hit as T;
      const created = this.#createInstance(scope, np, resolvingPath);
      this.#singletonCache.set(key, created);
      return created;
    }

    if (np.lifetime === "scoped") {
      const hit = scope.getScopedInChain(key);
      if (hit !== undefined) return hit as T;
      const created = this.#createInstance(scope, np, resolvingPath);
      scope.setScoped(key, created);
      if (scope.getAllowsScoped()) {
        maybeTrackDisposable(scope, created);
      }
      return created;
    }

    const created = this.#createInstance(scope, np, resolvingPath);
    if (scope.getAllowsScoped()) {
      maybeTrackDisposable(scope, created);
    }
    return created;
  }

  #createInstance<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    resolvingPath: RegistryKey[],
  ): T {
    const resolveDep = (dep: InjectionToken<unknown>) =>
      this.resolveFromScope(scope, dep, np.lifetime, resolvingPath);

    switch (np.providerType) {
      case "value":
        return np.useValue as T;

      case "existing": {
        const ex = np.useExisting!;
        return this.resolveFromScope(scope, ex, np.lifetime, resolvingPath) as T;
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
