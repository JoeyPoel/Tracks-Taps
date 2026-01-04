import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRawUnsafe(`SELECT sequence_name FROM information_schema.sequences;`);
        console.log('SEQUENCES FOUND:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
