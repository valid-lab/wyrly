import { token } from "@wyrly/core";
import type { UserRepository } from "../domain/user.ts";

export interface CurrentUser {
  id: string;
}

export const UserRepositoryToken = token<UserRepository>("UserRepository");
export const CurrentUserToken = token<CurrentUser>("CurrentUser");
