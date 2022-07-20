import { StorageAdapter } from "grammy";

interface ISession {
  key: string;
  value: string;
}

interface Where {
  key: string;
}

interface Create {
  key: string;
  value: string;
}

interface Update {
  value: string;
}

interface SessionDelegate {
  findUnique: (object: { where: Where }) => Promise<ISession | null>;
  upsert: (object: {
    where: Where;
    create: Create;
    update: Update;
  }) => Promise<ISession>;
  delete: (object: { where: Where }) => Promise<ISession>;
}

export class PrismaStorageAdapter<T> implements StorageAdapter<T> {
  private sessionDelegate: SessionDelegate;

  constructor(repository: SessionDelegate) {
    this.sessionDelegate = repository;
  }

  async read(key: string) {
    const session = await this.sessionDelegate.findUnique({ where: { key } });
    return session?.value ? (JSON.parse(session.value) as T) : undefined;
  }

  async write(key: string, data: T) {
    const value = JSON.stringify(data);
    await this.sessionDelegate.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async delete(key: string) {
    await this.sessionDelegate.delete({ where: { key } });
  }
}
