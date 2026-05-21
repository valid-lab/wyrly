import { token } from "@wyrly/core";

export interface User {
  id: string;
  name: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

export const UserRepositoryToken = token<UserRepository>("UserRepository");

/** Authenticated user (port). Map framework tokens in presentation only. */
export const CurrentUserToken = token<{ id: string }>("CurrentUser");
