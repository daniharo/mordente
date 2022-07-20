import { StorageAdapter } from "grammy";
import prisma from "../prisma/PrismaClient";

export class PrismaStorageAdapter<T> implements StorageAdapter<T> {
  async read(key: string) {
    const session = await prisma.session.findUnique({ where: { key } });
    return session?.value as T;
  }

  async write(key: string, value: T) {
    await prisma.session.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async delete(key: string) {
    await prisma.session.delete({ where: { key } });
  }
}
