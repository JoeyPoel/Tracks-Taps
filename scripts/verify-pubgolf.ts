import { activeTourService } from '../backend-mock/services/activeTourService';
import { prisma } from '../src/lib/prisma';

async function testPubGolf() {
    console.log('Starting PubGolf Verification...');

    try {
        // 1. Create a User
        const user = await prisma.user.upsert({
            where: { email: 'test@pubgolf.com' },
            update: {},
            create: {
                email: 'test@pubgolf.com',
                name: 'PubGolf Tester',
                passwordHash: 'hash',
            }
        });
        console.log('User created:', user.id);

        // 2. Create a Tour with PubGolf stops
        const tour = await prisma.tour.create({
            data: {
                title: 'PubGolf Test Tour',
                location: 'Test City',
                description: 'Testing PubGolf',
                imageUrl: 'http://example.com/image.jpg',
                distance: 5.0,
                duration: 120,
                points: 100,
                modes: ['WALKING'],
                difficulty: 'MEDIUM',
                authorId: user.id,
                stops: {
                    create: [
                        {
                            number: 1,
                            name: 'Pub 1',
                            description: 'First Stop',
                            order: 1,
                            longitude: 0,
                            latitude: 0,
                            pubgolfPar: 3,
                            pubgolfDrink: 'Pint of Lager'
                        },
                        {
                            number: 2,
                            name: 'Pub 2',
                            description: 'Second Stop',
                            order: 2,
                            longitude: 0,
                            latitude: 0,
                            pubgolfPar: 4,
                            pubgolfDrink: 'Glass of Wine'
                        }
                    ]
                }
            },
            include: { stops: true }
        });
        console.log('Tour created:', tour.id);

        // 3. Start Active Tour
        const activeTour = await activeTourService.startTourWithConflictCheck(tour.id, user.id, true);
        console.log('Active Tour started:', activeTour.id);

        // 4. Verify PubGolfStops created
        const pubGolfStops = await prisma.pubGolfStop.findMany({
            where: { activeTourId: activeTour.id }
        });
        console.log('PubGolf Stops created:', pubGolfStops.length);
        if (pubGolfStops.length !== 2) throw new Error('Expected 2 PubGolf stops');

        // 5. Update Score
        const stop1 = pubGolfStops.find(s => s.stopId === tour.stops[0].id);
        if (!stop1) throw new Error('Stop 1 not found');

        const updatedStop = await activeTourService.updatePubGolfScore(activeTour.id, stop1.stopId, 2); // Birdie!
        console.log('Score updated:', updatedStop.sips);

        if (updatedStop.sips !== 2) throw new Error('Score update failed');

        // 6. Verify Persistence
        const persistedStop = await prisma.pubGolfStop.findUnique({
            where: { id: stop1.id }
        });
        if (persistedStop?.sips !== 2) throw new Error('Score persistence failed');

        console.log('Verification Successful! 🍺⛳');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        // Cleanup (optional, but good for repeated runs)
        // await prisma.user.delete({ where: { email: 'test@pubgolf.com' } });
    }
}

testPubGolf();
