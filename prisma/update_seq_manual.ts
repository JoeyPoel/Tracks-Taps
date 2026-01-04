import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to update User ID sequence...');
    try {
        // PostgreSQL specific syntax
        await prisma.$executeRawUnsafe('ALTER SEQUENCE "User_id_seq" RESTART WITH 100000000;');
        console.log('SUCCESS: Sequence "User_id_seq" restarted at 100,000,000.');
    } catch (e) {
        console.error('ERROR: Failed to update sequence.', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
