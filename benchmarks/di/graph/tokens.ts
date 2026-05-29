/** Shared string tokens for libraries that do not use class constructors as keys. */
export const TOKENS = {
  ClientA: "ClientA",
  ClientB: "ClientB",
  ClientC: "ClientC",
  StoreA: "StoreA",
  StoreB: "StoreB",
  StoreC: "StoreC",
  ServiceA: "ServiceA",
  ServiceB: "ServiceB",
  ServiceC: "ServiceC",
  RootService: "RootService",
} as const;

export type TokenName = (typeof TOKENS)[keyof typeof TOKENS];
