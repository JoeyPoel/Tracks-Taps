import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tour = await prisma.tour.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            challenges: true,
            stops: {
                include: { challenges: true }
            }
        }
    });

    if (!tour) return;
    console.log("Tour ID:", tour.id);
    const bingoCount = tour.challenges.filter(c => c.bingoRow !== null && c.bingoCol !== null).length;
    console.log("Bingo challenges at top level:", bingoCount);

    // Check if bingo is in modes
    console.log("Modes:", tour.modes);
}
main().finally(() => process.exit(0));
