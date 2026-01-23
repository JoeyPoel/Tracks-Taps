
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const tours = await prisma.tour.findMany({
        select: { id: true, title: true, _count: { select: { stops: true } } }
    });
    console.log('--- Current Tours in DB ---');
    tours.forEach(t => {
        console.log(`[${t.id}] ${t.title} - Stops: ${t._count.stops}`);
    });
}

main().finally(() => prisma.$disconnect());
