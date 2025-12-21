import { ChallengeType, Difficulty, PrismaClient, SessionStatus, StopType } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hashedPassword}`;
};

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

    // 1. Create Users
    const joey = await prisma.user.create({
        data: {
            email: 'Joey@example.com',
            passwordHash: hashPassword('hashedpassword'),
            name: 'Joey',
            level: 5,
            xp: 1250,
            tokens: 150,
        },
    });

    const alice = await prisma.user.create({
        data: { email: 'alice@example.com', passwordHash: hashPassword('pw'), name: 'Alice', level: 3, xp: 400, tokens: 50 },
    });

    const bob = await prisma.user.create({
        data: { email: 'bob@example.com', passwordHash: hashPassword('pw'), name: 'Bob', level: 8, xp: 3000, tokens: 500 },
    });

    // Helper to create stops and challenges
    const createStopsAndChallenges = async (tourId: number, stopsData: any[]) => {
        for (const stopData of stopsData) {
            const stop = await prisma.stop.create({
                data: {
                    tourId: tourId,
                    name: stopData.name,
                    description: stopData.description,

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
                        type: challengeData.type,
                        points: challengeData.points,
                        content: challengeData.content || challengeData.description,
                        options: challengeData.options,
                        answer: challengeData.answer,
                        stopId: stop.id,
                        tourId: tourId,
                    } as any, // Cast to any to avoid TS error until client is regenerated
                });
            }
        }
    };

    const createReviews = async (tourId: number) => {
        const reviews = [
            {
                content: "Absolutely loved this tour! The views were breathtaking.",
                rating: 5,
                photos: ["https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"],
                authorId: joey.id
            },
            {
                content: "It was okay, but a bit too long for my taste.",
                rating: 3,
                photos: [],
                authorId: alice.id
            },
            {
                content: "Hidden gems everywhere! Highly recommend.",
                rating: 5,
                photos: ["https://images.unsplash.com/photo-1574169208507-84376144848b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"],
                authorId: bob.id
            },
            {
                content: "Good exercise but the stops were crowded.",
                rating: 4,
                photos: [],
                authorId: joey.id
            }
        ];

        // Shuffle and pick random 1-4 reviews
        const numReviews = Math.floor(Math.random() * 4) + 1;
        const selectedReviews = reviews.sort(() => 0.5 - Math.random()).slice(0, numReviews);

        for (const review of selectedReviews) {
            await prisma.review.create({
                data: {
                    content: review.content,
                    rating: review.rating,
                    photos: review.photos,
                    tourId: tourId,
                    authorId: review.authorId,
                }
            });
        }
    };

    // --- TOUR 1: Tata Steel Industrial Safari (Expanded) ---
    const tataTour = await prisma.tour.create({
        data: {
            title: 'Tata Steel Industrial Safari',
            location: 'IJmuiden',
            description: 'A deep dive into the massive industrial landscape. From blast furnaces to the North Sea dunes, this tour reveals the raw power and surprising nature of the Steelworks.',
            imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
            distance: 14.5,
            duration: 120, // Driving/Biking
            points: 1600,
            modes: ['DRIVING', 'BIKING'],
            difficulty: Difficulty.HARD,
            authorId: alice.id,
            startLat: 52.465,
            startLng: 4.600,
        },
    });

    const tataStops = [
        {
            name: 'Main Gate & Hoogovens Museum',
            description: 'The historic entrance. Start here to learn about the origins of the Royal Blast Furnaces.',
            order: 1,
            number: 1,
            lat: 52.4690,
            lng: 4.6042,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Blast from the Past',
                    description: 'Look at the historic photos.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'In what year was the "Koninklijke Hoogovens" founded?',
                    options: ['1918', '1924', '1945', '1900'],
                    answer: '1918',
                },
                {
                    title: 'Check-in',
                    description: 'Verify your arrival.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Blast Furnace 6 View',
            description: 'A safe viewing spot for one of the older furnaces, often emitting steam.',
            order: 2,
            number: 2,
            lat: 52.4670,
            lng: 4.5900,
            type: StopType.Facilities,
            challenges: [
                {
                    title: 'Steam Watch',
                    description: 'Count the steam vents.',
                    type: ChallengeType.TRIVIA,
                    points: 75,
                    content: 'How many major steam vents can you see on this unit?',
                    options: ['2', '4', '6', '8'],
                    answer: '4',
                }
            ]
        },
        {
            name: 'Blast Furnace 7',
            description: 'The heart of the operation. This massive structure converts iron ore into liquid iron.',
            order: 3,
            number: 3,
            lat: 52.4655,
            lng: 4.5800,
            type: StopType.Facilities,
            challenges: [
                {
                    title: 'Hot Stuff',
                    description: 'Observe the piping systems.',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'What is the approximate temperature inside a blast furnace?',
                    options: ['500°C', '1000°C', '1500°C', '2000°C'],
                    answer: '2000°C',
                }
            ]
        },
        {
            name: 'Coking Plant Viewpoint',
            description: 'Watch the "quenching" towers release massive clouds of steam as coke is cooled.',
            order: 4,
            number: 4,
            lat: 52.4720,
            lng: 4.5750,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Cloud Maker',
                    description: 'Wait for a steam cloud release.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                },
                {
                    title: 'Chemical Process',
                    description: 'What is "Coke" used for?',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'Why is coal converted into coke?',
                    options: ['To burn hotter', 'To remove impurities', 'To make it liquid', 'To add carbon'],
                    answer: 'To burn hotter',
                }
            ]
        },
        {
            name: 'North Sea Canal Harbor',
            description: 'Where raw materials arrive from all over the world. Massive cranes unload iron ore.',
            order: 5,
            number: 5,
            lat: 52.4630,
            lng: 4.5600,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Heavy Lifting',
                    description: 'Spot the unloading cranes.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'Which color are the giant unloading cranes usually painted?',
                    options: ['Red', 'Blue', 'Yellow', 'Green'],
                    answer: 'Blue',
                }
            ]
        },
        {
            name: 'Rolling Mills Exterior',
            description: 'The incredibly long buildings where steel slabs are rolled into thin sheets.',
            order: 6,
            number: 6,
            lat: 52.4600,
            lng: 4.5700,
            type: StopType.Facilities,
            challenges: [
                {
                    title: 'Length Estimation',
                    description: 'Estimate the building length.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'Approx. how long is the Hot Strip Mill?',
                    options: ['500m', '800m', '1.2km', '2km'],
                    answer: '800m',
                }
            ]
        },
        {
            name: 'Reyndersweg Beach',
            description: 'A surreal view where the industry meets the sea and surfers.',
            order: 7,
            number: 7,
            lat: 52.4750,
            lng: 4.5500,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Contrast Photo',
                    description: 'Capture the beach and factory.',
                    type: ChallengeType.PICTURE,
                    points: 150,
                    content: 'Take a photo showing both the sand/sea and the industrial skyline.',
                }
            ]
        },
        {
            name: 'Wijk aan Zee Bunkers',
            description: 'Remnants of the Atlantic Wall hidden in the dunes near the steelworks.',
            order: 8,
            number: 8,
            lat: 52.4800,
            lng: 4.5850,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Bunker Hunt',
                    description: 'Find a bunker entrance.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                },
                {
                    title: 'History Buff',
                    description: 'WWII Trivia.',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'Which line of defense were these bunkers part of?',
                    options: ['Maginot Line', 'Atlantic Wall', 'Siegfried Line', 'Dutch Water Line'],
                    answer: 'Atlantic Wall',
                }
            ]
        }
    ];

    await createStopsAndChallenges(tataTour.id, tataStops);
    await createReviews(tataTour.id);


    // --- TOUR 2: Barcelona: Gaudi's Dream ---
    const bcnGaudiTour = await prisma.tour.create({
        data: {
            title: 'Barcelona: Gaudi\'s Dream',
            location: 'Barcelona',
            description: 'Immerse yourself in the whimsical and organic world of Antoni Gaudi. Visit his most iconic masterpieces.',
            imageUrl: 'https://images.unsplash.com/photo-1543783207-9273e96ad03f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Sagrada Familia / Gaudi
            distance: 6.5,
            duration: 180,
            points: 1400,
            modes: ['WALKING', 'TRANSIT'],
            difficulty: Difficulty.MEDIUM,
            authorId: bob.id,
            startLat: 41.4036,
            startLng: 2.1744,
        },
    });

    const bcnGaudiStops = [
        {
            name: 'La Sagrada Familia',
            description: 'Gaudi\'s incomplete magnum opus. A basilica like no other.',
            order: 1,
            number: 1,
            lat: 41.4036,
            lng: 2.1744,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Facade Details',
                    description: 'Find the turtle.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'There is a turtle at the base of a column. Which facade is it on?',
                    options: ['Nativity', 'Passion', 'Glory', 'West'],
                    answer: 'Nativity',
                },
                {
                    title: 'Selfie with Glory',
                    description: 'Take a photo with the church.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Capture the sheer scale of the spires.',
                }
            ]
        },
        {
            name: 'Hospital de Sant Pau',
            description: 'Not Gaudi, but majestic Modernisme by Domènech i Montaner nearby.',
            order: 2,
            number: 2,
            lat: 41.4115,
            lng: 2.1750,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'The Tunnels',
                    description: 'Walk towards the entrance.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        },
        {
            name: 'Park Güell Entrance',
            description: 'First, admire the gingerbread-style gatehouses.',
            order: 3,
            number: 3,
            lat: 41.4145,
            lng: 2.1527,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Fairy Tale House',
                    description: 'Look at the roofs.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'What covers the roofs of the gatehouses?',
                    options: ['Trencadís Tiles', 'Thatch', 'Slate', 'Copper'],
                    answer: 'Trencadís Tiles',
                }
            ]
        },
        {
            name: 'The Dragon Stairway',
            description: 'Meet "El Drac", the famous mosaic salamander.',
            order: 4,
            number: 4,
            lat: 41.4150,
            lng: 2.1520,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Dragon Tamer',
                    description: 'Get close to the dragon.',
                    type: ChallengeType.LOCATION,
                    points: 150,
                }
            ]
        },
        {
            name: 'Casa Vicens',
            description: 'Gaudi\'s first major house, showcasing Moorish influences.',
            order: 5,
            number: 5,
            lat: 41.4035,
            lng: 2.1506,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Flower Power',
                    description: 'Examine the tiles.',
                    type: ChallengeType.TRIVIA,
                    points: 70,
                    content: 'What yellow flower features prominently on the tiles?',
                    options: ['Marigold', 'Sunflower', 'Rose', 'Tulip'],
                    answer: 'Marigold',
                }
            ]
        },
        {
            name: 'Casa Milà (La Pedrera)',
            description: 'The stone quarry house with iconic chimneys.',
            order: 6,
            number: 6,
            lat: 41.3954,
            lng: 2.1620,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Chimney Soldiers',
                    description: 'Look up at the roof.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                }
            ]
        },
        {
            name: 'Casa Batlló',
            description: 'The House of Bones. A colorful, skeletal masterpiece.',
            order: 7,
            number: 7,
            lat: 41.3917,
            lng: 2.1649,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Dragon Sword',
                    description: 'Spot the cross on top.',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'The roof represents the back of a dragon. What does the tower with the cross represent?',
                    options: ['St. George\'s Lance', 'A Tree', 'A Bone', 'A Flag'],
                    answer: 'St. George\'s Lance',
                }
            ]
        },
        {
            name: 'Cascada Monumental',
            description: 'A grand fountain in Ciutadella park where a young Gaudi assisted.',
            order: 8,
            number: 8,
            lat: 41.3888,
            lng: 2.1865,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Golden Chariot',
                    description: 'Find the top statue.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        }
    ];

    await createStopsAndChallenges(bcnGaudiTour.id, bcnGaudiStops);
    await createReviews(bcnGaudiTour.id);


    // --- TOUR 3: Barcelona: Gothic & Tapas ---
    const bcnTapasTour = await prisma.tour.create({
        data: {
            title: 'Barcelona: Gothic & Tapas',
            location: 'Barcelona',
            description: 'Wander the narrow medieval streets of the Gothic Quarter and stop for delicious tapas along the way.',
            imageUrl: 'https://images.unsplash.com/photo-1511537632536-b7a727ccf78e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Tapas / Food
            distance: 4.0,
            duration: 150,
            points: 1100,
            modes: ['WALKING'],
            difficulty: Difficulty.EASY,
            authorId: joey.id,
            startLat: 41.3833,
            startLng: 2.1750,
        },
    });

    const bcnTapasStops = [
        {
            name: 'Barcelona Cathedral',
            description: 'The heart of the Gothic quarter. Gothic splendor at its finest.',
            order: 1,
            number: 1,
            lat: 41.3840,
            lng: 2.1762,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Geese Guardian',
                    description: 'Enter the cloister.',
                    type: ChallengeType.TRIVIA,
                    points: 75,
                    content: 'How many white geese live in the cathedral cloister?',
                    options: ['13', '7', '10', '12'],
                    answer: '13',
                }
            ]
        },
        {
            name: 'Plaça del Rei',
            description: 'A medieval square surrounded by the Royal Palace.',
            order: 2,
            number: 2,
            lat: 41.3841,
            lng: 2.1775,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Royal Steps',
                    description: 'Stand on the stairs.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'El Xampanyet',
            description: 'A legendary tapas bar famous for its Cava and anchovies.',
            order: 3,
            number: 3,
            lat: 41.3850,
            lng: 2.1818,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Sparkling Toast',
                    description: 'Try the house drink.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What type of drink is "Xampanyet"?',
                    options: ['Sparkling Wine/Cava', 'Red Wine', 'Beer', 'Vermouth'],
                    answer: 'Sparkling Wine/Cava',
                }
            ]
        },
        {
            name: 'Santa Maria del Mar',
            description: 'The people\'s cathedral, built by sailors and porters.',
            order: 4,
            number: 4,
            lat: 41.3845,
            lng: 2.1820,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Porter\'s Strength',
                    description: 'Look at the main doors.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                },
                {
                    title: 'Book Fame',
                    description: 'Literature check.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'Which famous novel is set around the building of this church?',
                    options: ['Cathedral of the Sea', 'Shadow of the Wind', 'Pillars of the Earth', 'Angels & Demons'],
                    answer: 'Cathedral of the Sea',
                }
            ]
        },
        {
            name: 'Mercat de Santa Caterina',
            description: 'A colorful market with a waving mosaic roof.',
            order: 5,
            number: 5,
            lat: 41.3860,
            lng: 2.1780,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Roof Rainbow',
                    description: 'Look at the roof (if visible) or architecture.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Els Quatre Gats',
            description: 'A historic cafe where Picasso held his first exhibition.',
            order: 6,
            number: 6,
            lat: 41.3858,
            lng: 2.1735,
            type: StopType.Coffee_Drink,
            challenges: [
                {
                    title: 'Artistic Spirit',
                    description: 'Soak up the history.',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'Which artist designed the menu cover for this cafe?',
                    options: ['Picasso', 'Dali', 'Miro', 'Gaudi'],
                    answer: 'Picasso',
                }
            ]
        },
        {
            name: 'Plaça de Sant Jaume',
            description: 'The political center of Barcelona since Roman times.',
            order: 7,
            number: 7,
            lat: 41.3828,
            lng: 2.1770,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Power Center',
                    description: 'Identify the buildings.',
                    type: ChallengeType.LOCATION,
                    points: 40,
                }
            ]
        },
        {
            name: 'Can Culleretes',
            description: 'The oldest restaurant in Barcelona, dating back to 1786.',
            order: 8,
            number: 8,
            lat: 41.3810,
            lng: 2.1748,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Historical Feast',
                    description: 'Find the date on the sign.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'What year was this restaurant established?',
                    options: ['1786', '1850', '1900', '1650'],
                    answer: '1786',
                }
            ]
        }
    ];

    await createStopsAndChallenges(bcnTapasTour.id, bcnTapasStops);
    await createReviews(bcnTapasTour.id);


    // --- TOUR 4: Warsaw: Phoenix City ---
    const warsawTour = await prisma.tour.create({
        data: {
            title: 'Warsaw: Phoenix City',
            location: 'Warsaw',
            description: 'Discover the resilience of Warsaw. A journey through the reconstructed Old Town and historic landmarks reborn from ashes.',
            imageUrl: 'https://images.unsplash.com/photo-1519197924294-8ba99162e184?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Warsaw Old Town
            distance: 5.5,
            duration: 140,
            points: 1250,
            modes: ['WALKING'],
            difficulty: Difficulty.MEDIUM,
            authorId: alice.id,
            startLat: 52.2475,
            startLng: 21.0135,
        },
    });

    const warsawStops = [
        {
            name: 'Sigismund\'s Column',
            description: 'The meeting point of Warsaw, standing tall in Castle Square.',
            order: 1,
            number: 1,
            lat: 52.2475,
            lng: 21.0135,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'King of Heights',
                    description: 'Look at the statue.',
                    type: ChallengeType.TRIVIA,
                    points: 60,
                    content: 'What is King Sigismund holding?',
                    options: ['Cross and Sword', 'Orb and Scepter', 'Sword and Shield', 'Book'],
                    answer: 'Cross and Sword',
                }
            ]
        },
        {
            name: 'Royal Castle',
            description: 'The symbol of Polish statehood, beautifully reconstructed.',
            order: 2,
            number: 2,
            lat: 52.2480,
            lng: 21.0150,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Castle Clock',
                    description: 'Check the main tower.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Old Town Market Place',
            description: 'The vibrant heart of the Old Town with the Mermaid statue.',
            order: 3,
            number: 3,
            lat: 52.2497,
            lng: 21.0122,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Warrior Maid',
                    description: 'Find the Mermaid statue.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'What is the Warsaw Mermaid holding?',
                    options: ['Sword and Shield', 'Trident', 'Fishing Net', 'Harp'],
                    answer: 'Sword and Shield',
                },
                {
                    title: 'Market Selfie',
                    description: 'Photo with a colorful house.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Capture the colorful facades of the market square.',
                }
            ]
        },
        {
            name: 'Warsaw Barbican',
            description: 'The fortified outpost between the Old and New Towns.',
            order: 4,
            number: 4,
            lat: 52.2515,
            lng: 21.0105,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Wall Walk',
                    description: 'Touch the red bricks.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        },
        {
            name: 'Warsaw Uprising Monument',
            description: 'A powerful tribute to the heroes of 1944.',
            order: 5,
            number: 5,
            lat: 52.2493,
            lng: 21.0065,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Descending Soldiers',
                    description: 'Observe the figures.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'Where are the soldiers in the sculpture descending into?',
                    options: ['The Sewers', 'A Bunker', 'A Trench', 'The River'],
                    answer: 'The Sewers',
                }
            ]
        },
        {
            name: 'Chopin Bench',
            description: 'Sit and listen to Chopin\'s music on Krakowskie Przedmieście.',
            order: 6,
            number: 6,
            lat: 52.2435,
            lng: 21.0160,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Musical Rest',
                    description: 'Press the button.',
                    type: ChallengeType.LOCATION,
                    points: 70,
                }
            ]
        },
        {
            name: 'Holy Cross Church',
            description: 'Where Chopin\'s heart is preserved.',
            order: 7,
            number: 7,
            lat: 52.2390,
            lng: 21.0175,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Heart of the Matter',
                    description: 'Find the pillar.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'Whose heart is entombed in a pillar here?',
                    options: ['Frederic Chopin', 'Marie Curie', 'Copernicus', 'John Paul II'],
                    answer: 'Frederic Chopin',
                }
            ]
        },
        {
            name: 'Palace of Culture and Science',
            description: 'The controversial yet iconic Stalinist skyscraper.',
            order: 8,
            number: 8,
            lat: 52.2317,
            lng: 21.0060,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'The Gift',
                    description: 'Look up at the spire.',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'Who originally "gifted" this building to Poland?',
                    options: ['Soviet Union', 'USA', 'Germany', 'France'],
                    answer: 'Soviet Union',
                },
                {
                    title: 'Tallest Tale',
                    description: 'Verify the height.',
                    type: ChallengeType.TRUE_FALSE,
                    points: 50,
                    content: 'Is this the tallest building in Poland?',
                    answer: 'false', // Varso Tower is taller now
                }
            ]
        }
    ];

    await createStopsAndChallenges(warsawTour.id, warsawStops);
    await createReviews(warsawTour.id);


    // --- TOUR 5: Amsterdam Canals & Culture (Expanded) ---
    const amsterdamTour = await prisma.tour.create({
        data: {
            title: 'Amsterdam Canals & Culture',
            location: 'Amsterdam',
            description: 'Go beyond the Red Light District and explore the diverse architecture, hidden gems, and new icons of Amsterdam.',
            imageUrl: 'https://images.unsplash.com/photo-1542456209-411a5cc692c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', // Amsterdam Canal
            distance: 7.5,
            duration: 180,
            points: 1300,
            modes: ['WALKING', 'BIKING'],
            difficulty: Difficulty.EASY,
            authorId: alice.id,
            startLat: 52.3890,
            startLng: 4.8690,
        },
    });

    const amsStops = [
        {
            name: 'Het Schip',
            description: 'A masterpiece of the Amsterdam School. It looks like a ship!',
            order: 1,
            number: 1,
            lat: 52.3890,
            lng: 4.8690,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Hidden Shape',
                    description: 'Look at the corner.',
                    type: ChallengeType.RIDDLE,
                    points: 100,
                    content: 'I have a bow but no arrow, I have a deck but no cards. What am I?',
                    hint: 'Think about what kind of vessel this building resembles.',
                    answer: 'Ship',
                }
            ]
        },
        {
            name: 'NDSM Wharf',
            description: 'Former shipyard turned cultural hotspot with daily graffiti art.',
            order: 2,
            number: 2,
            lat: 52.3990,
            lng: 4.8930,
            type: StopType.Nightlife,
            challenges: [
                {
                    title: 'Selfie with Art',
                    description: 'Find a cool mural.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Capture the colorful expressions of NDSM.',
                }
            ]
        },
        {
            name: 'EYE Film Museum',
            description: 'Futuristic building dedicated to film history.',
            order: 3,
            number: 3,
            lat: 52.3845,
            lng: 4.9000,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Movie Star Pose',
                    description: 'Act like a star on the steps.',
                    type: ChallengeType.DARE,
                    points: 100,
                    content: 'Strike a dramatic pose on the stairs.',
                }
            ]
        },
        {
            name: 'A\'DAM Lookout',
            description: 'Observation deck with a swing over the edge.',
            order: 4,
            number: 4,
            lat: 52.3840,
            lng: 4.9015,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Over the Edge',
                    description: 'Look up at the swing.',
                    type: ChallengeType.LOCATION,
                    points: 70,
                }
            ]
        },
        {
            name: 'NEMO Science Museum',
            description: 'The green copper ship-shaped museum.',
            order: 5,
            number: 5,
            lat: 52.3740,
            lng: 4.9125,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Roof Walk',
                    description: 'Go to the roof piazza.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                },
                {
                    title: 'Architect',
                    description: 'Who designed this?',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'Which famous Italian architect designed NEMO?',
                    options: ['Renzo Piano', 'Michelangelo', 'Follador', 'Rossi'],
                    answer: 'Renzo Piano',
                }
            ]
        },
        {
            name: 'Scheepvaartmuseum',
            description: 'The National Maritime Museum with a replica ship.',
            order: 6,
            number: 6,
            lat: 52.3715,
            lng: 4.9150,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Ship Ahoy',
                    description: 'Spot the East Indiaman.',
                    type: ChallengeType.TRIVIA,
                    points: 60,
                    content: 'What is the name of the replica ship docked outside?',
                    options: ['Amsterdam', 'Batavia', 'De Zeven Provincien', 'Flying Dutchman'],
                    answer: 'Amsterdam',
                }
            ]
        },
        {
            name: 'Python Bridge',
            description: 'A winding red snake-like bridge.',
            order: 7,
            number: 7,
            lat: 52.3755,
            lng: 4.9350,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Red Snake',
                    description: 'Walk the curves.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        },
        {
            name: 'Brouwerij \'t IJ',
            description: 'A brewery under a windmill.',
            order: 8,
            number: 8,
            lat: 52.3665,
            lng: 4.9265,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Ostrich Logo',
                    description: 'Find the bird logo.',
                    type: ChallengeType.TRIVIA,
                    points: 75,
                    content: 'What bird is the logo of this brewery?',
                    options: ['Ostrich', 'Eagle', 'Swan', 'Duck'],
                    answer: 'Ostrich',
                }
            ]
        }
    ];

    await createStopsAndChallenges(amsterdamTour.id, amsStops);
    await createReviews(amsterdamTour.id);


    // --- TOUR 6: Breda PubGolf Championship (Preserved) ---
    const bredaTour = await prisma.tour.create({
        data: {
            title: 'Breda PubGolf Championship',
            location: 'Breda',
            description: 'The ultimate pub golf experience in the pearl of the south. 12 holes, 12 drinks, one champion.',
            imageUrl: 'https://images.unsplash.com/photo-1569496453553-f35768ed0e36?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            distance: 3.5,
            duration: 240, // 4 hours
            points: 1500,
            modes: ['PUBGOLF', 'WALKING'],
            difficulty: Difficulty.HARD,
            authorId: joey.id,
            startLat: 51.5887,
            startLng: 4.7760,
        },
    });

    const bredaStops = [
        {
            name: 'De Beyerd',
            description: 'Hole 1: Start with a classic specialty beer.',
            order: 1,
            number: 1,
            lat: 51.5895,
            lng: 4.7780,
            type: StopType.Food_Dining,
            pubgolfPar: 3,
            pubgolfDrink: 'Specialty Beer',
            challenges: [
                {
                    title: 'Brew Master',
                    description: 'What is the name of their home-brewed beer?',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'Which beer is brewed right here in De Beyerd?',
                    options: ['Drie Hoefijzers', 'Breda Royal', 'Beyerd Hefe', 'Jupiler'],
                    answer: 'Drie Hoefijzers',
                }
            ]
        },
        {
            name: 'Café de Bruine Pij',
            description: 'Hole 2: An iconic brown cafe under the Church.',
            order: 2,
            number: 2,
            lat: 51.5885,
            lng: 4.7765,
            type: StopType.Nightlife,
            pubgolfPar: 4,
            pubgolfDrink: 'Pilsner (Flute)',
            challenges: [
                {
                    title: 'Under the Tower',
                    description: 'Look at the church tower.',
                    type: ChallengeType.LOCATION,
                    points: 40,
                }
            ]
        },
        {
            name: '\'t Hart van Breda',
            description: 'Hole 3: Famous for nachos and gezelligheid.',
            order: 3,
            number: 3,
            lat: 51.5888,
            lng: 4.7758,
            type: StopType.Food_Dining,
            pubgolfPar: 3,
            pubgolfDrink: 'White Wine / White Beer',
            challenges: [
                {
                    title: 'Nacho Count',
                    description: 'Guess the toppings.',
                    type: ChallengeType.TRIVIA,
                    points: 60,
                    content: 'What is the "Famous" snack here?',
                    options: ['Nachos', 'Bitterballen', 'Frikandel', 'Cheese Souffle'],
                    answer: 'Nachos',
                }
            ]
        },
        {
            name: 'De Bommel',
            description: 'Hole 4: Time for a stronger pace.',
            order: 4,
            number: 4,
            lat: 51.5890,
            lng: 4.7750,
            type: StopType.Nightlife,
            pubgolfPar: 2,
            pubgolfDrink: 'Shot of Salmari',
            challenges: [
                {
                    title: 'Quick Shot',
                    description: 'Cheers with the group!',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        },
        {
            name: 'Dok 19',
            description: 'Hole 5: Craft beer by the harbor.',
            order: 5,
            number: 5,
            lat: 51.5910,
            lng: 4.7720,
            type: StopType.Coffee_Drink,
            pubgolfPar: 5,
            pubgolfDrink: 'IPA',
            challenges: [
                {
                    title: 'Harbor View',
                    description: 'Spot a boat.',
                    type: ChallengeType.LOCATION,
                    points: 45,
                }
            ]
        },
        {
            name: 'Proost',
            description: 'Hole 6: Dance and drink.',
            order: 6,
            number: 6,
            lat: 51.5880,
            lng: 4.7770,
            type: StopType.Nightlife,
            pubgolfPar: 3,
            pubgolfDrink: 'Gin Tonic',
            challenges: [
                {
                    title: 'Dance Off',
                    description: 'Show your best move.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                }
            ]
        },
        {
            name: 'Dependance',
            description: 'Hole 7: Keep the momentum going.',
            order: 7,
            number: 7,
            lat: 51.5878,
            lng: 4.7775,
            type: StopType.Nightlife,
            pubgolfPar: 4,
            pubgolfDrink: 'Pilsner (Pint)',
            challenges: [
                {
                    title: 'Song Guess',
                    description: 'What song is playing?',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'Is this a Dutch sing-along?',
                    options: ['Yes', 'No'],
                    answer: 'Yes',
                }
            ]
        },
        {
            name: 'Walkabout',
            description: 'Hole 8: Australian vibes.',
            order: 8,
            number: 8,
            lat: 51.5875,
            lng: 4.7780,
            type: StopType.Nightlife,
            pubgolfPar: 3,
            pubgolfDrink: 'Snakebite',
            challenges: [
                {
                    title: 'Kangaroo Spotting',
                    description: 'Find the Kangaroo logo.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Coyote',
            description: 'Hole 9: It\'s getting wild.',
            order: 9,
            number: 9,
            lat: 51.5872,
            lng: 4.7785,
            type: StopType.Nightlife,
            pubgolfPar: 2,
            pubgolfDrink: 'Tequila Shot',
            challenges: [
                {
                    title: 'Bar Dance',
                    description: 'Is anyone dancing on the bar?',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'What happens at the Coyote Ugly bar?',
                    options: ['Bar Dancing', 'Karaoke', 'Bingo', 'Quiz'],
                    answer: 'Bar Dancing',
                }
            ]
        },
        {
            name: 'Peddels',
            description: 'Hole 10: The smallest pub.',
            order: 10,
            number: 10,
            lat: 51.5870,
            lng: 4.7788,
            type: StopType.Nightlife,
            pubgolfPar: 5,
            pubgolfDrink: 'Beer Pitcher (Share)',
            challenges: [
                {
                    title: 'Crowd Squeeze',
                    description: 'Fit inside!',
                    type: ChallengeType.LOCATION,
                    points: 120,
                }
            ]
        },
        {
            name: 'Studio',
            description: 'Hole 11: Almost there.',
            order: 11,
            number: 11,
            lat: 51.5882,
            lng: 4.7762,
            type: StopType.Nightlife,
            pubgolfPar: 3,
            pubgolfDrink: 'Vodka Redbull',
            challenges: [
                {
                    title: 'Energy Boost',
                    description: 'Feel the energy.',
                    type: ChallengeType.LOCATION,
                    points: 70,
                }
            ]
        },
        {
            name: 'Holy Moly',
            description: 'Hole 12: The Grand Finale.',
            order: 12,
            number: 12,
            lat: 51.5892,
            lng: 4.7755,
            type: StopType.Food_Dining,
            pubgolfPar: 4,
            pubgolfDrink: 'Cocktail',
            challenges: [
                {
                    title: 'Tree of Life',
                    description: 'Find the big tree inside.',
                    type: ChallengeType.LOCATION,
                    points: 200,
                },
                {
                    title: 'Champion\'s Trivia',
                    description: 'Final question.',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'What is the colloquial name for people from Breda during Carnival?',
                    options: ['Kielegatters', 'Kruikenzeikers', 'Oeteldonkers', 'Tullepetaon'],
                    answer: 'Kielegatters',
                }
            ]
        }
    ];

    await createStopsAndChallenges(bredaTour.id, bredaStops);
    await createReviews(bredaTour.id);


    // --- Mock Active Tour for Dev ---
    // Start the Breda tour for Joey
    const activeTour = await prisma.activeTour.create({
        data: {
            id: 112233445,
            tourId: bredaTour.id,
            status: SessionStatus.IN_PROGRESS,
        },
    });

    await prisma.team.create({
        data: {
            activeTour: { connect: { id: activeTour.id } },
            user: { connect: { id: joey.id } },
            name: "Orange Lions",
            color: '#FFAA00',
            emoji: '🦁',
            currentStop: 1,
            score: 0,
        }
    });

    console.log('Seed data created successfully with 6 high-quality tours.');
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
