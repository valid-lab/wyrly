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
  dedupeEdges,
  type DependencyGraph,
} from "./graph.ts";
import {
  allProvidersScoped,
  buildFrozenScopedPlan,
  type FrozenScopedPlan,
} from "./frozen_scoped.ts";
import {
  allProvidersSingleton,
  buildFrozenSingletonPlan,
  type FrozenSingletonPlan,
} from "./frozen_singleton.ts";
import { compileAllDepKeys, compileProvider, ensureDepKeys, ResolvePlan } from "./resolve_plan.ts";

const SCOPE_POOL_MAX = 32;
const FROZEN_MISS = Symbol("FROZEN_MISS");
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
  /** Registers multiple providers in one pass (composition roots). */
  registerMany(
    entries: readonly (readonly [InjectionToken<unknown>, Provider<unknown>])[],
  ): void;
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
  #localValues: Map<RegistryKey, unknown> | undefined;
  #localProviders: Map<RegistryKey, NormalizedProvider<unknown>> | undefined;
  #scopedCache: Map<RegistryKey, unknown> | undefined;
  #scopedValues: unknown[] | undefined;
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
    const localProviders = this.#ensureLocalProviders();
    if (localProviders.has(np.key)) {
      throw new DuplicateProviderError(token);
    }
    localProviders.set(np.key, np);
    this.#bindingsEmpty = false;
  }

  set<T>(token: InjectionToken<T>, value: T): void {
    if (this.#disposed) throw new ScopeDisposedError();
    this.#ensureLocalValues().set(registryKey(token), value);
    this.#bindingsEmpty = false;
  }

  createChildScope(): Scope {
    if (this.#disposed) throw new ScopeDisposedError();
    if (!this.#allowsScoped) {
      throw new InvalidProviderError("InvalidProvider_child_scope_not_allowed");
    }
    return new ScopeImpl(this.#container, { allowsScoped: true, parent: this });
  }

  disposeSync(options?: ScopeDisposeOptions): void {
    if (this.#disposed) return;
    if (this.disposers.length > 0) {
      throw new InvalidProviderError(
        "disposeSync() cannot be used when disposers are registered.",
      );
    }
    this.#finishDispose(options);
  }

  async dispose(options?: ScopeDisposeOptions): Promise<void> {
    if (this.#disposed) return;
    if ((this.#children?.size ?? 0) > 0) {
      throw new ScopeHasActiveChildrenError();
    }
    if (this.disposers.length === 0) {
      this.#finishDispose(options);
      return;
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
    this.#clearScopeMaps();
  }

  #finishDispose(_options?: ScopeDisposeOptions): void {
    if (this.#disposed) return;
    if ((this.#children?.size ?? 0) > 0) {
      throw new ScopeHasActiveChildrenError();
    }
    if (this.#parent) {
      this.#parent.#children?.delete(this);
    }
    if (
      this.#allowsScoped && !this.#isInnerRoot && this.disposers.length === 0 &&
      this.#container.releaseScopeToPool(this)
    ) {
      return;
    }
    this.#disposed = true;
    this.#clearScopeMaps();
  }

  #clearScopeMaps(): void {
    this.#scopedCache?.clear();
    if (this.#scopedValues) {
      this.#scopedValues.length = 0;
    }
    this.#scopedValues = undefined;
    this.#localProviders?.clear();
    this.#localValues?.clear();
    this.#scopedCache = undefined;
    this.#localProviders = undefined;
    this.#localValues = undefined;
    this.#bindingsEmpty = true;
    this.#scopedCacheEmpty = true;
  }

  /** Clears scope state when returning to the container pool (stays disposed until reused). */
  prepareForPool(): void {
    this.#children = undefined;
    this.disposers.length = 0;
    this.#clearScopeMaps();
    this.#disposed = true;
  }

  resetForReuse(): void {
    this.#disposed = false;
    this.#children = undefined;
    this.disposers.length = 0;
    this.#clearScopeMaps();
  }

  #ensureScopedValues(size: number): unknown[] {
    if (!this.#scopedValues || this.#scopedValues.length < size) {
      this.#scopedValues = new Array(size);
    }
    return this.#scopedValues;
  }

  getScopedByIndex(index: number): unknown | undefined {
    return this.#scopedValues?.[index];
  }

  /** Used by container frozen scoped materialization. */
  initScopedValueArray(size: number): unknown[] {
    return this.#ensureScopedValues(size);
  }

  markScopedCacheUsed(): void {
    this.#scopedCacheEmpty = false;
  }

  setScopedByIndex(index: number, value: unknown, slotCount: number): void {
    this.#ensureScopedValues(slotCount)[index] = value;
    this.#scopedCacheEmpty = false;
  }

  getScopedInChainByIndex(index: number): unknown | undefined {
    const hit = this.#scopedValues?.[index];
    if (hit !== undefined) return hit;
    return this.#parent?.getScopedInChainByIndex(index);
  }

  findLocalValue(key: RegistryKey): unknown | undefined {
    if (this.#localValues?.has(key)) {
      return this.#localValues.get(key);
    }
    return this.#parent?.findLocalValue(key);
  }

  hasLocalValue(key: RegistryKey): boolean {
    return this.findLocalValue(key) !== undefined;
  }

  getLocalValue(key: RegistryKey): unknown {
    return this.#localValues?.get(key);
  }

  findLocalProvider(key: RegistryKey): NormalizedProvider<unknown> | undefined {
    const local = this.#localProviders?.get(key);
    if (local !== undefined) return local;
    return this.#parent?.findLocalProvider(key);
  }

  getLocalProvider(key: RegistryKey): NormalizedProvider<unknown> | undefined {
    return this.#localProviders?.get(key);
  }

  getScopedInChain(key: RegistryKey): unknown | undefined {
    const idx = this.#container.slotIndexForKey(key);
    if (idx !== undefined) {
      return this.getScopedInChainByIndex(idx);
    }
    const hit = this.#scopedCache?.get(key);
    if (hit !== undefined) return hit;
    return this.#parent?.getScopedInChain(key);
  }

  getScoped(key: RegistryKey): unknown {
    return this.#scopedCache?.get(key);
  }

  setScoped(key: RegistryKey, value: unknown, slotIndex?: number): void {
    if (slotIndex !== undefined && slotIndex >= 0) {
      this.setScopedByIndex(slotIndex, value, this.#container.scopedSlotCount());
      return;
    }
    this.#ensureScopedCache().set(key, value);
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

  #ensureLocalValues(): Map<RegistryKey, unknown> {
    if (!this.#localValues) {
      this.#localValues = new Map();
    }
    return this.#localValues;
  }

  #ensureLocalProviders(): Map<RegistryKey, NormalizedProvider<unknown>> {
    if (!this.#localProviders) {
      this.#localProviders = new Map();
    }
    return this.#localProviders;
  }

  #ensureScopedCache(): Map<RegistryKey, unknown> {
    if (!this.#scopedCache) {
      this.#scopedCache = new Map();
    }
    return this.#scopedCache;
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
  readonly #resolvePlan = new ResolvePlan();
  readonly #singletonCache = new Map<RegistryKey, unknown>();
  readonly #scopePool: ScopeImpl[] = [];
  #innerRootScope: ScopeImpl | undefined;
  #frozenScopedPlan: FrozenScopedPlan | undefined;
  #frozenSingletonPlan: FrozenSingletonPlan | undefined;

  #getInnerRoot(): ScopeImpl {
    if (!this.#innerRootScope) {
      this.#innerRootScope = new ScopeImpl(this, { allowsScoped: false, isInnerRoot: true });
    }
    return this.#innerRootScope;
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
    this.#registerNormalized(np, token);
  }

  registerMany(
    entries: readonly (readonly [InjectionToken<unknown>, Provider<unknown>])[],
  ): void {
    let anyScoped = false;
    const seen = new Set<RegistryKey>();
    for (let i = 0; i < entries.length; i++) {
      const [token, provider] = entries[i]!;
      const np = this.#normalizeProviderForBatch(token, provider);
      if (seen.has(np.key) || this.#resolvePlan.has(np.key)) {
        throw new DuplicateProviderError(token);
      }
      seen.add(np.key);
      if (np.lifetime === "scoped") anyScoped = true;
      this.#resolvePlan.register(np);
    }
    this.#invalidateFrozenPlans(!anyScoped);
  }

  /** Fast path for composition-root batch registration (benchmark + Workers bootstrap). */
  #normalizeProviderForBatch(
    token: InjectionToken<unknown>,
    provider: Provider<unknown>,
  ): NormalizedProvider<unknown> {
    if ("useClass" in provider) {
      const explicitDeps = provider.deps;
      const explicitLifetime = provider.lifetime;
      if (explicitDeps !== undefined && explicitLifetime !== undefined) {
        const key = registryKey(token);
        return {
          token,
          key,
          providerType: "class",
          deps: explicitDeps,
          lifetime: explicitLifetime,
          useClass: provider.useClass,
        } as NormalizedProvider<unknown>;
      }
    }
    return normalizeProvider(token, provider) as NormalizedProvider<unknown>;
  }

  #registerNormalized(
    np: NormalizedProvider<unknown>,
    tokenForError: InjectionToken<unknown>,
  ): void {
    if (this.#resolvePlan.has(np.key)) {
      throw new DuplicateProviderError(tokenForError);
    }
    this.#resolvePlan.register(np);
    this.#invalidateFrozenPlans(np.lifetime !== "scoped");
  }

  override<T>(token: InjectionToken<T>, provider: Provider<T>): void {
    const np = normalizeProvider(token, provider) as NormalizedProvider<unknown>;
    this.#resolvePlan.register(np);
    this.#singletonCache.delete(np.key);
    this.#invalidateFrozenPlans();
  }

  #invalidateFrozenPlans(skipScopedInvalidate = false): void {
    if (!skipScopedInvalidate) {
      this.#frozenScopedPlan = undefined;
    }
    this.#frozenSingletonPlan = undefined;
  }

  #ensureFrozenScopedPlan(): void {
    if (this.#frozenScopedPlan !== undefined) return;
    if (!allProvidersScoped(this.#resolvePlan.iterateSlots())) return;
    this.#frozenScopedPlan = buildFrozenScopedPlan(this.#resolvePlan.iterateSlots());
  }

  #ensureFrozenSingletonPlan(): void {
    if (this.#frozenSingletonPlan !== undefined) return;
    if (!allProvidersSingleton(this.#resolvePlan.iterateSlots())) return;
    this.#frozenSingletonPlan = buildFrozenSingletonPlan(this.#resolvePlan.iterateSlots());
  }

  slotIndexForKey(key: RegistryKey): number | undefined {
    return this.#resolvePlan.getSlotIndex(key);
  }

  scopedSlotCount(): number {
    return this.#resolvePlan.slotCount;
  }

  releaseScopeToPool(scope: ScopeImpl): boolean {
    if (this.#scopePool.length >= SCOPE_POOL_MAX) return false;
    scope.prepareForPool();
    this.#scopePool.push(scope);
    return true;
  }

  resolve<T>(token: InjectionToken<T>): T {
    const key = registryKey(token);
    const innerRoot = this.#innerRootScope;
    if (!innerRoot || innerRoot.canUltraFastCache()) {
      const hit = this.#singletonCache.get(key);
      if (hit !== undefined) return hit as T;
      const frozen = this.#tryFrozenSingletonResolve<T>(key);
      if (frozen !== FROZEN_MISS) return frozen as T;
    }
    return this.resolveFromScope(this.#getInnerRoot(), token, null, []);
  }

  createScope(): Scope {
    this.#ensureFrozenScopedPlan();
    const pooled = this.#scopePool.pop();
    if (pooled) {
      pooled.resetForReuse();
      return pooled;
    }
    return new ScopeImpl(this, { allowsScoped: true });
  }

  inspect(): DependencyGraph {
    const providers = this.#resolvePlan.registeredProviders();
    const base = buildGraph(providers);
    const extra: InjectionToken<unknown>[] = [];
    for (const p of providers) {
      for (const d of p.deps) extra.push(d);
    }
    const graph = augmentGraphWithInjectableClasses(base, extra);
    return { nodes: graph.nodes, edges: dedupeEdges(graph.edges) };
  }

  validate(options?: ValidateOptions): ValidationResult {
    return validateNormalizedProviders(
      this.#resolvePlan.registeredProviders(),
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
    if (!scope.getAllowsScoped()) {
      if (!scope.canUltraFastCache()) return undefined;
      const singletonHit = this.#singletonCache.get(key);
      if (singletonHit !== undefined) return singletonHit as T;
      return undefined;
    }

    if (!scope.canUltraFastCache()) return undefined;
    if (scope.hasScopedCacheInChain()) {
      const scopedHit = scope.getScopedInChain(key);
      if (scopedHit !== undefined) return scopedHit as T;
      const slot = this.#resolvePlan.peek(key);
      if (slot?.np.lifetime === "singleton") {
        const hit = this.#singletonCache.get(key);
        if (hit !== undefined) return hit as T;
      }
      return undefined;
    }
    return undefined;
  }

  resolveFromScope<T>(
    scope: ScopeImpl,
    token: InjectionToken<T>,
    consumerLifetime: Lifetime | null,
    resolvingPath: RegistryKey[],
  ): T {
    return this.#resolveFromScopeByKey(
      scope,
      registryKey(token),
      token,
      consumerLifetime,
      resolvingPath,
    );
  }

  #resolveFromScopeByKey<T>(
    scope: ScopeImpl,
    key: RegistryKey,
    tokenForErrors: InjectionToken<T>,
    consumerLifetime: Lifetime | null,
    resolvingPath: RegistryKey[],
  ): T {
    if (scope.isDisposed()) throw new ScopeDisposedError();

    const ultraFast = this.#tryUltraFastCache<T>(scope, key);
    if (ultraFast !== undefined) return ultraFast;

    if (!scope.getAllowsScoped()) {
      const frozenSingleton = this.#tryFrozenSingletonResolve<T>(key);
      if (frozenSingleton !== FROZEN_MISS) return frozenSingleton as T;
    }

    if (scope.getAllowsScoped() && !scope.hasScopedCacheInChain()) {
      const frozen = this.#tryFrozenScopedResolve<T>(scope, key);
      if (frozen !== FROZEN_MISS) return frozen as T;
    }

    const localValue = scope.findLocalValue(key);
    if (localValue !== undefined) {
      return localValue as T;
    }

    const localProv = scope.findLocalProvider(key);
    const compiled = this.#resolvePlan.get(key);
    const regProv = compiled?.np;
    const np = localProv ??
      regProv ??
      (typeof tokenForErrors === "function" &&
          getInjectableMetadata(tokenForErrors as ClassToken<unknown>)
        ? syntheticClassProvider(tokenForErrors as ClassToken<T>) as NormalizedProvider<unknown>
        : undefined);

    if (!np) {
      throw new ProviderNotFoundError(tokenForErrors, pathIdsFromKeys([...resolvingPath, key]));
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
      const idx = compiled?.slotIndex;
      const hit = idx !== undefined && idx >= 0
        ? scope.getScopedInChainByIndex(idx)
        : scope.getScopedInChain(np.key);
      if (hit !== undefined) return hit as T;
    }

    if (scope.isResolving(key)) {
      const cyclePath = pathIdsFromKeys([...scope.getResolvingStack(), key]);
      throw new CircularDependencyError(cyclePath);
    }

    const pathWithSelf = [...resolvingPath, key];
    scope.pushResolving(key);
    try {
      const plan = localProv ? compileProviderForResolve(localProv) : compiled;
      return this.#materialize(scope, np as NormalizedProvider<T>, pathWithSelf, plan);
    } finally {
      scope.popResolving();
    }
  }

  #materialize<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    resolvingPath: RegistryKey[],
    compiled: ReturnType<ResolvePlan["get"]>,
  ): T {
    const key = np.key;

    if (np.lifetime === "singleton") {
      const created = this.#createInstance(scope, np, resolvingPath, compiled);
      this.#singletonCache.set(key, created);
      return created;
    }

    if (np.lifetime === "scoped") {
      const created = this.#createInstance(scope, np, resolvingPath, compiled);
      scope.setScoped(key, created, compiled?.slotIndex);
      if (scope.getAllowsScoped()) {
        maybeTrackDisposable(scope, created);
      }
      return created;
    }

    const created = this.#createInstance(scope, np, resolvingPath, compiled);
    if (scope.getAllowsScoped()) {
      maybeTrackDisposable(scope, created);
    }
    return created;
  }

  #createInstance<T>(
    scope: ScopeImpl,
    np: NormalizedProvider<T>,
    resolvingPath: RegistryKey[],
    compiled: ReturnType<ResolvePlan["get"]>,
  ): T {
    const depKeys = compiled?.depKeys ??
      np.deps.map((dep) => registryKey(dep));
    const resolveDepByKey = (depKey: RegistryKey) =>
      this.#resolveFromScopeByKey(
        scope,
        depKey,
        depKey as InjectionToken<unknown>,
        np.lifetime,
        resolvingPath,
      );

    switch (np.providerType) {
      case "value":
        return np.useValue as T;

      case "existing": {
        const exKey = depKeys[0]!;
        return this.#resolveFromScopeByKey(
          scope,
          exKey,
          np.useExisting!,
          np.lifetime,
          resolvingPath,
        ) as T;
      }

      case "factory": {
        const args = depKeys.map((depKey) => resolveDepByKey(depKey));
        return np.useFactory!(scope, ...args) as T;
      }

      case "class": {
        const Ctor = np.useClass!;
        const args = depKeys.map((depKey) => resolveDepByKey(depKey)) as never[];
        const instance = new (Ctor as new (...args: never[]) => T)(...args);
        return instance;
      }

      default:
        throw new InvalidProviderError("InvalidProvider_unsupported_provider_type", {
          providerType: String(np.providerType),
        });
    }
  }

  #tryFrozenSingletonResolve<T>(key: RegistryKey): T | typeof FROZEN_MISS {
    this.#ensureFrozenSingletonPlan();
    const plan = this.#frozenSingletonPlan;
    if (!plan) return FROZEN_MISS;
    if (this.#singletonCache.size === 0) {
      this.#materializeFrozenSingletonGraph(plan);
    } else if (!this.#singletonCache.has(key)) {
      return FROZEN_MISS;
    }
    const hit = this.#singletonCache.get(key);
    if (hit === undefined) return FROZEN_MISS;
    return hit as T;
  }

  #materializeFrozenSingletonGraph(plan: FrozenSingletonPlan): void {
    if (plan.ordered.some((slot) => slot.depKeys === undefined && slot.np.deps.length > 0)) {
      compileAllDepKeys(plan.ordered);
    }
    const scope = this.#getInnerRoot();
    for (let i = 0; i < plan.ordered.length; i++) {
      const slot = plan.ordered[i]!;
      const key = slot.np.key;
      if (this.#singletonCache.has(key)) continue;
      const created = this.#createInstanceFromFrozenSingleton(scope, slot);
      this.#singletonCache.set(key, created);
    }
  }

  #createInstanceFromFrozenSingleton(
    scope: ScopeImpl,
    slot: NonNullable<ReturnType<ResolvePlan["get"]>>,
  ): unknown {
    const np = slot.np;
    const depKeys = slot.depKeys ?? ensureDepKeys(slot);

    switch (np.providerType) {
      case "value":
        return np.useValue;

      case "existing": {
        const exKey = depKeys[0]!;
        return this.#singletonCache.get(exKey);
      }

      case "factory": {
        const args = depKeys.map((depKey) => this.#singletonCache.get(depKey));
        return np.useFactory!(scope, ...args);
      }

      case "class": {
        const args = depKeys.map((depKey) => this.#singletonCache.get(depKey)) as never[];
        const Ctor = np.useClass!;
        return new (Ctor as new (...args: never[]) => unknown)(...args);
      }

      default:
        throw new InvalidProviderError("InvalidProvider_unsupported_provider_type", {
          providerType: String(np.providerType),
        });
    }
  }

  #tryFrozenScopedResolve<T>(scope: ScopeImpl, key: RegistryKey): T | typeof FROZEN_MISS {
    const plan = this.#frozenScopedPlan;
    if (!plan) return FROZEN_MISS;
    const idx = this.#resolvePlan.getSlotIndex(key);
    if (idx === undefined) return FROZEN_MISS;
    this.#materializeFrozenScopedGraph(scope, plan);
    const hit = scope.getScopedByIndex(idx);
    if (hit === undefined) return FROZEN_MISS;
    return hit as T;
  }

  #materializeFrozenScopedGraph(scope: ScopeImpl, plan: FrozenScopedPlan): void {
    const slotCount = this.#resolvePlan.slotCount;
    const values = scope.initScopedValueArray(slotCount);
    compileAllDepKeys(plan.ordered);
    for (let i = 0; i < plan.ordered.length; i++) {
      const slot = plan.ordered[i]!;
      if (values[slot.slotIndex] !== undefined) continue;
      const created = this.#createInstanceFromFrozen(scope, slot, values);
      values[slot.slotIndex] = created;
      if (scope.getAllowsScoped()) {
        maybeTrackDisposable(scope, created);
      }
    }
    scope.markScopedCacheUsed();
  }

  #createInstanceFromFrozen(
    scope: ScopeImpl,
    slot: NonNullable<ReturnType<ResolvePlan["get"]>>,
    values: unknown[],
  ): unknown {
    const np = slot.np;
    const depKeys = ensureDepKeys(slot);

    switch (np.providerType) {
      case "value":
        return np.useValue;

      case "existing": {
        const exIdx = this.#resolvePlan.getSlotIndex(depKeys[0]!);
        return exIdx !== undefined ? values[exIdx] : undefined;
      }

      case "factory": {
        const args = depKeys.map((depKey) => {
          const depIdx = this.#resolvePlan.getSlotIndex(depKey)!;
          return values[depIdx];
        });
        return np.useFactory!(scope, ...args);
      }

      case "class": {
        const args = depKeys.map((depKey) => {
          const depIdx = this.#resolvePlan.getSlotIndex(depKey)!;
          return values[depIdx];
        }) as never[];
        const Ctor = np.useClass!;
        return new (Ctor as new (...args: never[]) => unknown)(...args);
      }

      default:
        throw new InvalidProviderError("InvalidProvider_unsupported_provider_type", {
          providerType: String(np.providerType),
        });
    }
  }
}

function compileProviderForResolve(
  np: NormalizedProvider,
): NonNullable<ReturnType<ResolvePlan["get"]>> {
  return compileProvider(np, -1);
}
