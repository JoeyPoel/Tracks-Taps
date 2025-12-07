import { ChallengeType, Difficulty, PrismaClient, SessionStatus, StopType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.pubGolfStop.deleteMany();
    await prisma.activeChallenge.deleteMany();
    await prisma.team.deleteMany();
    await prisma.activeTour.deleteMany();
    await prisma.review.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.stop.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.user.deleteMany();

    // ... (Users and Tours creation remains same, no changes needed there)

    // 1. Create Users
    const joey = await prisma.user.create({
        data: {
            email: 'Joey@example.com',
            passwordHash: 'hashedpassword',
            name: 'Joey',
            level: 5,
            xp: 1250,
            tokens: 150,
        },
    });

    const alice = await prisma.user.create({
        data: { email: 'alice@example.com', passwordHash: 'pw', name: 'Alice', level: 3, xp: 400, tokens: 50 },
    });

    const bob = await prisma.user.create({
        data: { email: 'bob@example.com', passwordHash: 'pw', name: 'Bob', level: 8, xp: 3000, tokens: 500 },
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
            startLat: 52.0907,
            startLng: 5.1214,
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
            startLat: 52.3600,
            startLng: 4.8852,
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
            startLat: 51.9089,
            startLng: 4.4876,
        },
    });

    // Helper to create stops and challenges
    const createStopsAndChallenges = async (tourId: number, stopsData: any[]) => {
        for (const stopData of stopsData) {
            const stop = await prisma.stop.create({
                data: {
                    tourId: tourId,
                    name: stopData.name,
                    description: stopData.description,
                    order: stopData.order,
                    number: stopData.number,
                    latitude: stopData.lat,
                    longitude: stopData.lng,
                    pubgolfPar: stopData.pubgolfPar,
                    pubgolfDrink: stopData.pubgolfDrink,
                    type: stopData.type || StopType.Viewpoint,
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
                        tourId: tourId,
                    },
                });
            }
        }
    };

    // 3. Create Stops & Challenges for Utrecht Tour
    const utrechtStops = [
        {
            name: 'Dom Tower',
            description: 'The tallest church tower in the Netherlands. A landmark you cannot miss.',
            order: 1,
            number: 1,
            lat: 52.0907,
            lng: 5.1214,
            type: StopType.Monument_Landmark,
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
            type: StopType.Monument_Landmark,
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
                    options: ['The Thinker on a Rock', 'The Hare', 'Miffy', 'The Rabbit'],
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
            type: StopType.Viewpoint,
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
            type: StopType.Food_Dining,
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
        }
    ];

    await createStopsAndChallenges(utrechtTour.id, utrechtStops);

    // 4. Create Stops & Challenges for Amsterdam Tour
    const amsterdamStops = [
        {
            name: 'Rijksmuseum',
            description: 'The Dutch national museum dedicated to arts and history.',
            order: 1,
            number: 1,
            lat: 52.3600,
            lng: 4.8852,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Art Lover',
                    description: 'Find the Night Watch.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Masterpiece Trivia',
                    description: 'Who painted The Night Watch?',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'Who is the painter of the famous Night Watch?',
                    options: ['Rembrandt', 'Van Gogh', 'Vermeer', 'Mondrian'],
                    answer: 'Rembrandt',
                }
            ]
        },
        {
            name: 'Vondelpark',
            description: 'The most famous park in the Netherlands.',
            order: 2,
            number: 2,
            lat: 52.3580,
            lng: 4.8686,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Park Stroll',
                    description: 'Take a walk through the park.',
                    type: ChallengeType.LOCATION,
                    points: 30,
                },
                {
                    title: 'Statue Hunt',
                    description: 'Find the Picasso statue.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'Which famous artist has a sculpture in Vondelpark?',
                    options: ['Picasso', 'Rodin', 'Dali', 'Moore'],
                    answer: 'Picasso',
                }
            ]
        },
        {
            name: 'Anne Frank House',
            description: 'The writer\'s house and biographical museum.',
            order: 3,
            number: 3,
            lat: 52.3752,
            lng: 4.8840,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'History Lesson',
                    description: 'Visit the Anne Frank House.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                },
                {
                    title: 'Diary Details',
                    description: 'When was the diary published?',
                    type: ChallengeType.TRIVIA,
                    points: 60,
                    content: 'In which year was The Diary of a Young Girl first published?',
                    options: ['1947', '1950', '1945', '1955'],
                    answer: '1947',
                }
            ]
        },
        {
            name: 'Dam Square',
            description: 'The historical center of the city.',
            order: 4,
            number: 4,
            lat: 52.3731,
            lng: 4.8926,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Royal Palace',
                    description: 'Take a selfie with the Royal Palace.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Monumental',
                    description: 'What is the white pillar?',
                    type: ChallengeType.TRIVIA,
                    points: 40,
                    content: 'What does the National Monument on Dam Square commemorate?',
                    options: ['WWII Victims', 'The Monarchy', 'The Golden Age', 'Independence'],
                    answer: 'WWII Victims',
                }
            ]
        }
    ];

    await createStopsAndChallenges(amsterdamTour.id, amsterdamStops);

    // 5. Create Stops & Challenges for Rotterdam Tour
    const rotterdamStops = [
        {
            name: 'Erasmus Bridge',
            description: 'The Swan of Rotterdam.',
            order: 1,
            number: 1,
            lat: 51.9089,
            lng: 4.4876,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Bridge Run',
                    description: 'Run across the bridge.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                },
                {
                    title: 'Swan Song',
                    description: 'Why is it called The Swan?',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'What is the nickname of the Erasmus Bridge?',
                    options: ['The Swan', 'The Goose', 'The Crane', 'The Harp'],
                    answer: 'The Swan',
                }
            ]
        },
        {
            name: 'Cube Houses',
            description: 'Innovative houses built on pylons.',
            order: 2,
            number: 2,
            lat: 51.9207,
            lng: 4.4906,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Architectural Wonder',
                    description: 'Take a photo of a Cube House.',
                    type: ChallengeType.LOCATION,
                    points: 75,
                },
                {
                    title: 'Cube Trivia',
                    description: 'Who designed the Cube Houses?',
                    type: ChallengeType.TRIVIA,
                    points: 125,
                    content: 'Who is the architect behind the Cube Houses?',
                    options: ['Piet Blom', 'Rem Koolhaas', 'Winy Maas', 'Ben van Berkel'],
                    answer: 'Piet Blom',
                }
            ]
        },
        {
            name: 'Markthal',
            description: 'A residential and office building with a market hall underneath.',
            order: 3,
            number: 3,
            lat: 51.9193,
            lng: 4.4867,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Foodie Heaven',
                    description: 'Find a tasty snack.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Ceiling Art',
                    description: 'Look up!',
                    type: ChallengeType.TRIVIA,
                    points: 60,
                    content: 'What is depicted on the ceiling of the Markthal?',
                    options: ['Fruits and Vegetables', 'Stars', 'Historical Figures', 'Ships'],
                    answer: 'Fruits and Vegetables',
                }
            ]
        },
        {
            name: 'Euromast',
            description: 'Observation tower designed by Hugh Maaskant.',
            order: 4,
            number: 4,
            lat: 51.9054,
            lng: 4.4666,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'High Point',
                    description: 'Reach the Euromast.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                },
                {
                    title: 'Height Check',
                    description: 'How tall is it?',
                    type: ChallengeType.TRIVIA,
                    points: 70,
                    content: 'How tall is the Euromast?',
                    options: ['185m', '150m', '200m', '100m'],
                    answer: '185m',
                }
            ]
        }
    ];

    await createStopsAndChallenges(rotterdamTour.id, rotterdamStops);

    // 6. Create Pub Golf Tour
    const pubGolfTour = await prisma.tour.create({
        data: {
            title: 'Utrecht Pub Golf',
            location: 'Utrecht',
            description: 'A competitive twist on the classic pub crawl. 9 Holes, 9 Drinks. Can you make par?',
            imageUrl: 'https://images.unsplash.com/photo-1574096079513-d82599602950?q=80&w=2574&auto=format&fit=crop',
            distance: 4.0,
            duration: 240,
            points: 1000,
            modes: ['PUBGOLF'],
            difficulty: Difficulty.HARD,
            authorId: alice.id,
            startLat: 52.0935,
            startLng: 5.1205,
        },
    });

    const pubGolfStops = [
        {
            name: 'Hole 1: The Florin',
            description: 'Start your round at this English pub.',
            order: 1,
            number: 1,
            lat: 52.0935,
            lng: 5.1205,
            type: StopType.Nightlife,
            pubgolfPar: 3,
            pubgolfDrink: 'Pint of Lager',
            challenges: [
                {
                    title: 'Tee Off',
                    description: 'Finish your first drink.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Hole 2: Mick O\'Connells',
            description: 'An Irish challenge awaits.',
            order: 2,
            number: 2,
            lat: 52.0910,
            lng: 5.1160,
            type: StopType.Nightlife,
            pubgolfPar: 4,
            pubgolfDrink: 'Guinness',
            challenges: [
                {
                    title: 'Irish Luck',
                    description: 'Cheers with a stranger.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        },
        {
            name: 'Hole 3: Kafé België',
            description: 'Specialty beers on the menu.',
            order: 3,
            number: 3,
            lat: 52.0895,
            lng: 5.1195,
            type: StopType.Nightlife,
            pubgolfPar: 5,
            pubgolfDrink: 'Strong Blond Beer',
            challenges: [
                {
                    title: 'Beer Connoisseur',
                    description: 'Guess the alcohol percentage.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'What is the ABV of the house beer?',
                    options: ['5%', '6.5%', '8%', '10%'],
                    answer: '8%',
                }
            ]
        }
    ];

    await createStopsAndChallenges(pubGolfTour.id, pubGolfStops);

    // 6. Create Active Tours for Joey
    // Active Tour 1: Utrecht (In Progress)
    const activeTourId = 123456789;
    const activeTour = await prisma.activeTour.create({
        data: {
            id: activeTourId,
            tourId: utrechtTour.id,
            status: SessionStatus.IN_PROGRESS,
        },
    });

    // Create Team for Joey in that active tour
    const joeyTeam = await prisma.team.create({
        data: {
            activeTour: { connect: { id: activeTour.id } },
            user: { connect: { id: joey.id } },
            name: "Joey's Team",
            color: '#FF375D',
            emoji: '🚀',
            currentStop: 1,
            score: 50,
        }
    });

    // Active Tour 2: Amsterdam (Abandoned)
    const activeTour2 = await prisma.activeTour.create({
        data: {
            id: 987654321,
            tourId: amsterdamTour.id,
            status: SessionStatus.ABANDONED,
        },
    });

    await prisma.team.create({
        data: {
            activeTour: { connect: { id: activeTour2.id } },
            user: { connect: { id: joey.id } },
            name: "Single Player",
            currentStop: 1,
        }
    });

    // Active Tour 3: Rotterdam (Completed)
    const activeTour3 = await prisma.activeTour.create({
        data: {
            id: 112233445,
            tourId: rotterdamTour.id,
            status: SessionStatus.COMPLETED,
        },
    });

    await prisma.team.create({
        data: {
            activeTour: { connect: { id: activeTour3.id } },
            user: { connect: { id: joey.id } },
            name: "Winning Team",
            currentStop: 4,
            finishedAt: new Date(),
        }
    });


    // 7. Create Active Challenges (Simulate progress for Utrecht)
    // Let's say Joey has completed the first stop's challenges
    const firstStop = await prisma.stop.findFirst({
        where: { tourId: utrechtTour.id, order: 1 },
        include: { challenges: true },
    });

    if (firstStop) {
        for (const challenge of firstStop.challenges) {
            await prisma.activeChallenge.create({
                data: {
                    teamId: joeyTeam.id,
                    challengeId: challenge.id,
                    completed: true,
                    completedAt: new Date(),
                },
            });
        }
    }

    // 8. Create Reviews
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
        const fs = require('fs');
        fs.writeFileSync('seed_error.txt', JSON.stringify(e, null, 2));
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
