import { token } from "@wyrly/core";
import type { CurrentUser } from "../application/get_user.ts";
import type { UserRepository } from "../domain/user.ts";

export const UserRepositoryToken = token<UserRepository>("UserRepository");
export const CurrentUserToken = token<CurrentUser>("CurrentUser");
