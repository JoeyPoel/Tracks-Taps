import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('CRITICAL ERROR: No database connection string found.');
    console.error('process.env.DIRECT_URL is ' + (process.env.DIRECT_URL ? 'DEFINED' : 'UNDEFINED'));
    console.error('process.env.DATABASE_URL is ' + (process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED'));
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
