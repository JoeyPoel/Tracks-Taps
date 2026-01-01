
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.achievement.count();
    console.log(`Total Achievements in DB: ${count}`);

    const all = await prisma.achievement.findMany();
    console.log('Achievements:', all.map(a => a.title));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
