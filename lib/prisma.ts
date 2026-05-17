import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const adapter = new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }));

const prismaClient = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? (['query', 'error', 'warn'] as const) : ['error'],
});

const globalForPrisma = globalThis as unknown as { prisma: typeof prismaClient };

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = globalForPrisma.prisma || prismaClient;
