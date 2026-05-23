export class UserId {
  private constructor(private readonly value: string) {}

  static from(value: string): UserId {
    if (value.trim() === "") {
      throw new Error("UserId must not be empty.");
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
}

export interface User {
  id: UserId;
  name: string;
}
