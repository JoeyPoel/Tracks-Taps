import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
    const counts = await prisma.tour.groupBy({
        by: ['status'],
        _count: {
            _all: true
        }
    });
    console.log("Tour counts by status:", counts);

    const tours = await prisma.tour.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            location: true,
        }
    });
    console.log("All tours:", tours);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
