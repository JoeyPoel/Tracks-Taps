import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
    const result = await prisma.tour.updateMany({
        where: { status: 'PENDING_REVIEW' },
        data: { status: 'PUBLISHED' }
    });
    console.log(`Updated ${result.count} tours to PUBLISHED status!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
