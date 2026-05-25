export interface User {
  id: string;
  name: string;
}

export interface UserRepository {
  findByIds(ids: string[]): Promise<User[]>;
}
