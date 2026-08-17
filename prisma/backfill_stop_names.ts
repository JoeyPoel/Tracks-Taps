import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting backfill for stopNames on existing tours...');
    try {
        const tours = await prisma.tour.findMany({
            include: {
                stops: {
                    orderBy: {
                        number: 'asc'
                    }
                }
            }
        });

        console.log(`Found ${tours.length} tours to process.`);

        let successCount = 0;
        for (const tour of tours) {
            const stopNames = tour.stops.map(s => s.name || '');
            console.log(`Tour ID ${tour.id} ("${tour.title}"): updating with stops [${stopNames.join(', ')}]`);
            
            await prisma.tour.update({
                where: { id: tour.id },
                data: {
                    stopNames: stopNames
                }
            });
            successCount++;
        }

        console.log(`Backfill completed successfully. Updated ${successCount} tours.`);
    } catch (e) {
        console.error('Error during stopNames backfill:', e);
    }
}

main()
    .catch(err => {
        console.error('Fatal error in backfill execution:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
