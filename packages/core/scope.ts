import type { Provider } from "./provider.ts";
import type { InjectionToken } from "./token.ts";

export interface Scope {
  resolve<T>(token: InjectionToken<T>): T;
  register<T>(token: InjectionToken<T>, provider: Provider<T>): void;
  set<T>(token: InjectionToken<T>, value: T): void;
  dispose(): Promise<void>;
  isDisposed(): boolean;
}
