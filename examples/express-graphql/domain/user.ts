import { token } from "@wyrly/core";

export interface User {
  id: string;
  name: string;
}

export interface UserRepository {
  findByIds(ids: string[]): Promise<User[]>;
}

export const UserRepositoryToken = token<UserRepository>("UserRepository");

export const CurrentUserToken = token<{ id: string }>("CurrentUser");
