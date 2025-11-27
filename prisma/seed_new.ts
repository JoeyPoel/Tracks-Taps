import { ChallengeType, Difficulty, PrismaClient, SessionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.activeChallenge.deleteMany();
    await prisma.activeTour.deleteMany();
    await prisma.review.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.stop.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Users
    const joey = await prisma.user.create({
        data: {
            email: 'Joey@example.com',
            passwordHash: 'hashedpassword',
            name: 'Joey',
            level: 5,
            score: 1250,
        },
    });

    const alice = await prisma.user.create({
        data: { email: 'alice@example.com', passwordHash: 'pw', name: 'Alice', level: 3, score: 400 },
    });

    const bob = await prisma.user.create({
        data: { email: 'bob@example.com', passwordHash: 'pw', name: 'Bob', level: 8, score: 3000 },
    });

    // 2. Create Tours
    // Tour 1: Utrecht Pub Crawl (The active one)
    const utrechtTour = await prisma.tour.create({
        data: {
            title: 'Utrecht Pub Crawl',
            location: 'Utrecht',
            description: 'Experience the vibrant nightlife of Utrecht while exploring its historic canals and hidden gems. A perfect mix of history and hops!',
            imageUrl: 'https://images.unsplash.com/photo-1605218427368-35b0f9930e7e?q=80&w=2669&auto=format&fit=crop',
            distance: 3.5,
            duration: 180, // 3 hours
            points: 500,
            modes: ['WALKING', 'DRINKING'],
            difficulty: Difficulty.MEDIUM,
            authorId: alice.id,
        },
    });

    // Tour 2: Amsterdam Canal Walk
    const amsterdamTour = await prisma.tour.create({
        data: {
            title: 'Amsterdam Canal Walk',
            location: 'Amsterdam',
            description: 'A scenic walk along the most beautiful canals of Amsterdam. Discover the Golden Age architecture.',
            imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a2?q=80&w=2670&auto=format&fit=crop',
            distance: 5.0,
            duration: 120,
            points: 300,
            modes: ['WALKING'],
            difficulty: Difficulty.EASY,
            authorId: bob.id,
        },
    });

    // Tour 3: Rotterdam Architecture Run
    const rotterdamTour = await prisma.tour.create({
        data: {
            title: 'Rotterdam Architecture Run',
            location: 'Rotterdam',
            description: 'For the fit explorers! Run past the Cube Houses, Erasmus Bridge, and the Markthal.',
            imageUrl: 'https://images.unsplash.com/photo-1496429831386-82283f23c960?q=80&w=2670&auto=format&fit=crop',
            distance: 10.0,
            duration: 60,
            points: 800,
            modes: ['RUNNING'],
            difficulty: Difficulty.HARD,
            authorId: alice.id,
        },
    });

    // 3. Create Stops & Challenges for Utrecht Tour
    const stopsData = [
        {
            name: 'Dom Tower',
            description: 'The tallest church tower in the Netherlands. A landmark you cannot miss.',
            order: 1,
            number: 1,
            lat: 52.0907,
            lng: 5.1214,
            challenges: [
                {
                    title: 'Dom Arrival',
                    description: 'Stand directly under the Dom Tower.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Tower Trivia',
                    description: 'How tall is the Dom Tower?',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What is the exact height of the Dom Tower?',
                    options: ['112 meters', '105 meters', '98 meters', '120 meters'],
                    answer: '112 meters',
                }
            ]
        },
        {
            name: 'Neude Square',
            description: 'The bustling heart of Utrecht, surrounded by terraces and the old post office.',
            order: 2,
            number: 2,
            lat: 52.0928,
            lng: 5.1190,
            challenges: [
                {
                    title: 'Neude Check-in',
                    description: 'Reach the center of Neude Square.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Statue Spotting',
                    description: 'Identify the statue.',
                    type: ChallengeType.TRIVIA,
                    points: 75,
                    content: 'Which famous hare statue is located on the Neude?',
                    options: ['Thinker on a Rock', 'The Hare', 'Miffy', 'The Rabbit'],
                    answer: 'The Thinker on a Rock',
                }
            ]
        },
        {
            name: 'Oudegracht Canals',
            description: 'Walk along the unique wharves of the Oudegracht.',
            order: 3,
            number: 3,
            lat: 52.0900,
            lng: 5.1180,
            challenges: [
                {
                    title: 'Wharf Walk',
                    description: 'Go down to the water level at the wharves.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        },
        {
            name: 'Belgian Beer Café Olivier',
            description: 'A pub located in an old hidden church.',
            order: 4,
            number: 4,
            lat: 52.0915,
            lng: 5.1150,
            challenges: [
                {
                    title: 'Cheers!',
                    description: 'Arrive at Olivier.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                },
                {
                    title: 'History Buff',
                    description: 'What was this building before?',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'What was the original function of this building?',
                    options: ['A Church', 'A School', 'A Hospital', 'A Barracks'],
                    answer: 'A Church',
                }
            ]
        },
        {
            name: 'Relax at the Park',
            description: 'A peaceful end to the tour. No challenges here, just enjoy.',
            order: 5,
            number: 5,
            lat: 52.0950,
            lng: 5.1250,
            challenges: [] // No challenges
        }
    ];

    for (const stopData of stopsData) {
        const stop = await prisma.stop.create({
            data: {
                tourId: utrechtTour.id,
                name: stopData.name,
                description: stopData.description,
                order: stopData.order,
                number: stopData.number,
                latitude: stopData.lat,
                longitude: stopData.lng,
            },
        });

        for (const challengeData of stopData.challenges) {
            await prisma.challenge.create({
                data: {
                    title: challengeData.title,
                    description: challengeData.description,
                    type: challengeData.type,
                    points: challengeData.points,
                    content: challengeData.content,
                    options: challengeData.options,
                    answer: challengeData.answer,
                    stopId: stop.id,
                    tourId: utrechtTour.id, // Explicitly connect to tour
                },
            });
        }
    }

    // 4. Create Active Tour for Joey
    const activeTour = await prisma.activeTour.create({
        data: {
            tourId: utrechtTour.id,
            status: SessionStatus.IN_PROGRESS,
            participants: {
                connect: { id: joey.id },
            },
        },
    });

    // 5. Create Active Challenges (Simulate progress)
    // Let's say Joey has completed the first stop's challenges
    const firstStop = await prisma.stop.findFirst({
        where: { tourId: utrechtTour.id, order: 1 },
        include: { challenges: true },
    });

    if (firstStop) {
        for (const challenge of firstStop.challenges) {
            await prisma.activeChallenge.create({
                data: {
                    activeTourId: activeTour.id,
                    challengeId: challenge.id,
                    completed: true,
                    completedAt: new Date(),
                },
            });
        }
    }

    // 6. Create Reviews
    await prisma.review.create({
        data: {
            content: 'Amazing tour! The pubs were great and the history was fascinating.',
            rating: 5,
            tourId: utrechtTour.id,
            authorId: bob.id,
        },
    });

    await prisma.review.create({
        data: {
            content: 'A bit too long for me, but beautiful sights.',
            rating: 4,
            tourId: amsterdamTour.id,
            authorId: joey.id,
        },
    });

    console.log('Seed data created successfully');
    console.log(`Created user: ${joey.email}`);
    console.log(`Created active tour ID: ${activeTour.id} for tour: ${utrechtTour.title}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
