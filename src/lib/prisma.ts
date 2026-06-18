import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma?: PrismaClient; pool?: Pool };

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
    console.error('CRITICAL ERROR: No database connection string found.');
    console.error('process.env.DIRECT_URL is ' + (process.env.DIRECT_URL ? 'DEFINED' : 'UNDEFINED'));
    console.error('process.env.DATABASE_URL is ' + (process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED'));
}

// Reuse existing pool if available to prevent connection leaks during HMR
const pool = globalForPrisma.pool || new Pool({ connectionString, max: 10 });

let prismaClientInstance: PrismaClient;

if (globalForPrisma.prisma) {
    prismaClientInstance = globalForPrisma.prisma;
} else {
    const adapter = new PrismaPg(pool);
    prismaClientInstance = new PrismaClient({
        adapter,
        log: ['query'],
    });
}

export const prisma = prismaClientInstance;

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}
