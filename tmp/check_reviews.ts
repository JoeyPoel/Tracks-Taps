
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking reviews for tour 41...');
    const tour = await prisma.tour.findUnique({
        where: { id: 41 },
        include: {
            reviews: {
                include: {
                    author: true
                }
            },
            _count: {
                select: { reviews: true }
            }
        }
    });

    if (!tour) {
        console.log('Tour 41 not found');
        return;
    }

    console.log('Tour 41 found:', tour.title);
    console.log('Review count from Prisma count:', tour._count.reviews);
    console.log('Number of reviews in relation:', tour.reviews.length);
    
    tour.reviews.forEach((r, i) => {
        console.log(`Review ${i + 1}:`, {
            id: r.id,
            content: r.content,
            rating: r.rating,
            author: r.author.name
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
