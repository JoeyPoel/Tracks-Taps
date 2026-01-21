import { PrismaPg } from '@prisma/adapter-pg';
import { ChallengeType, Difficulty, PrismaClient, SessionStatus, StopType } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

console.log('DATABASE_URL connection string:', `"${process.env.DATABASE_URL}"`);

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from environment variables');
}

const connectionString = process.env.DATABASE_URL;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) is missing from environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.userPlayedTour.deleteMany();
    await prisma.userPlayedTour.deleteMany();
    // Notification model deleted
    await prisma.friendship.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.pubGolfStop.deleteMany();
    await prisma.activeChallenge.deleteMany();
    await prisma.team.deleteMany();
    await prisma.activeTour.deleteMany();
    await prisma.review.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.stop.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.achievement.deleteMany();

    // Reset sequences if needed (optional for postgres usually, but good practice in some envs)

    await prisma.user.deleteMany();

    // 1. Create Users
    const joey = await prisma.user.create({
        data: {
            email: 'Joey@example.com',
            name: 'Joey',
            level: 5,
            xp: 1250,
            tokens: 150,
        },
    });

    const alice = await prisma.user.create({
        data: { email: 'alice@example.com', name: 'Alice', level: 3, xp: 400, tokens: 50 },
    });

    const bob = await prisma.user.create({
        data: { email: 'bob@example.com', name: 'Bob', level: 8, xp: 3000, tokens: 500 },
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
                    imageUrl: stopData.imageUrl,
                    detailedDescription: stopData.detailedDescription,
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

    const createTourChallenges = async (tourId: number, challengesData: any[]) => {
        for (const challengeData of challengesData) {
            await prisma.challenge.create({
                data: {
                    title: challengeData.title,
                    type: challengeData.type,
                    points: challengeData.points,
                    content: challengeData.content || challengeData.description,
                    options: challengeData.options,
                    answer: challengeData.answer,
                    tourId: tourId,
                    // Pass through bingo coordinates if present
                    bingoRow: challengeData.bingoRow,
                    bingoCol: challengeData.bingoCol,
                } as any,
            });
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

    // --- TOUR 1: Tata Steel Industrial Safari (Survival Mode) ---
    const tataTour = await prisma.tour.create({
        data: {
            title: 'Tata Steel: Industrial Survival',
            location: 'IJmuiden',
            description: 'A dystopian journey through the smoke and steel. Navigate the blast furnaces, dodge the steam, and survive the wasteland.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/TataSteel.png`,
            distance: 14.5,
            duration: 120,
            points: 2000,
            modes: ['BIKING', 'BINGO'], // Bingo added
            difficulty: Difficulty.HARD,
            authorId: alice.id,
            startLat: 52.465,
            startLng: 4.600,
            status: 'PUBLISHED',
        },
    });

    const tataStops = [
        {
            name: 'Hoogovens Gate 1',
            description: 'The mouth of the beast. Decode the entry signs.',
            order: 1,
            number: 1,
            lat: 52.4690,
            lng: 4.6042,
            type: StopType.Facilities,
            imageUrl: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9bf9?auto=format&fit=crop&w=800&q=80',
            detailedDescription: 'You stand before the main gate of the Koninklijke Hoogovens, founded in 1918. The air tastes of iron and history. Your first task is to identify the raw materials entering this facility.',
            challenges: [
                {
                    title: 'Material Intake',
                    description: 'Read the logistics manifest (or plaque).',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'Which country provides the majority of the iron ore processed here?',
                    options: ['Brazil', 'Sweden', 'Australia', 'Canada'],
                    answer: 'Brazil', // Creating a harder/more specific fact
                },
                {
                    title: 'Access Control',
                    description: 'Verify your clearance.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Blast Furnace 7: The Titan',
            description: 'Witness the liquid fire. Temperature check required.',
            detailedDescription: 'Blast Furnace 7 is one of the largest in Europe. It runs 24/7, consuming coke and ore to spit out liquid iron. The heat radiating from it can be felt from 100 meters away.',
            order: 2,
            number: 2,
            lat: 52.4655,
            lng: 4.5800,
            type: StopType.Facilities,
            challenges: [
                {
                    title: 'Thermal Reading',
                    description: 'Estimate the core temp.',
                    type: ChallengeType.TRIVIA,
                    points: 200,
                    content: 'What is the precise temperature at the bottom of the blast furnace (the hearth)?',
                    options: ['2200°C', '1800°C', '1500°C', '3000°C'],
                    answer: '2200°C', // Hard trivia
                },
                {
                    title: 'Smoke Signal',
                    description: 'Capture the exhaust.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Take a photo of the white steam plume against the sky.',
                }
            ]
        },
        {
            name: 'Coking Plant No. 2',
            description: 'The darkest part of the plant. Coal into Carbon.',
            order: 3,
            number: 3,
            lat: 52.4720,
            lng: 4.5750,
            type: StopType.Facilities,
            challenges: [
                {
                    title: 'Chemical Byproduct',
                    description: 'Sniff the air (carefully).',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'What gas is a primary byproduct of the coking process, often reused for power?',
                    options: ['Coke Oven Gas', 'Methane', 'Hydrogen Sulfide', 'Propane'],
                    answer: 'Coke Oven Gas',
                },
                {
                    title: 'Coal Mountains',
                    description: 'Find the stockpile.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                }
            ]
        },
        {
            name: 'The Harbor Cranes',
            description: 'Giants that feed the furnaces.',
            order: 4,
            number: 4,
            lat: 52.4630,
            lng: 4.5600,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Crane Capacity',
                    description: 'Look for the load limit.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'What is the maximum lifting capacity of the main blue unloader cranes?',
                    options: ['50 Tonnes', '40 Tonnes', '60 Tonnes', '80 Tonnes'],
                    answer: '50 Tonnes',
                }
            ]
        },
        {
            name: 'Reyndersweg Dunes',
            description: 'Where nature fights back. The contrast stop.',
            order: 5,
            number: 5,
            lat: 52.4750,
            lng: 4.5500,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Dystopian Selfie',
                    description: 'You and the factory.',
                    type: ChallengeType.PICTURE,
                    points: 150,
                    content: 'Take a selfie with the steelworks looming in the background behind the dunes.',
                },
                {
                    title: 'Bunker Search',
                    description: 'Find the concrete.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        },
        {
            name: 'Wijk aan Zee Pier',
            description: 'The end of the line. Watch the ships leave.',
            order: 6,
            number: 6,
            lat: 52.4900,
            lng: 4.5700,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Ship Spotter',
                    description: 'Identify a vessel.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What type of ship is most common here?',
                    options: ['Bulk Carrier', 'Tanker', 'Container Ship', 'Cruise Ship'],
                    answer: 'Bulk Carrier',
                }
            ]
        }
    ];

    await createStopsAndChallenges(tataTour.id, tataStops);
    await createReviews(tataTour.id);

    // Tour-wide Bonus Challenges (Bingo Candidates)
    const tataTourChallenges = [
        {
            title: 'Worker Watch',
            description: 'Spot a worker.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'What color helmets do the safety supervisors wear?',
            options: ['White', 'Yellow', 'Red', 'Blue'],
            answer: 'White',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Train Spotting',
            description: 'Find a torpedo car.',
            type: ChallengeType.PICTURE,
            points: 150,
            content: 'Take a picture of a "Torpedo" rail car used for liquid iron.',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'Wildlife',
            description: 'Is that a fox?',
            type: ChallengeType.TRIVIA,
            points: 200,
            content: 'What wild animal is famously known to roam the dunes near the steelworks?',
            options: ['Red Fox', 'Deer', 'Boar', 'Wolf'],
            answer: 'Red Fox',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Chimney Stack',
            description: 'Count the stripes.',
            type: ChallengeType.TRIVIA,
            points: 80,
            content: 'How many red stripes are on the tallest chimney visible from Gate 1?',
            options: ['2', '3', '4', '5'],
            answer: '3',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Steam Cloud',
            description: 'Capture the cloud.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a photo of a steam cloud released from a cooling tower.',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Safety First',
            description: 'Find a safety sign.',
            type: ChallengeType.LOCATION,
            points: 50,
            content: 'Locate the nearest emergency assembly point sign.',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Rust Hunter',
            description: 'Find some rust.',
            type: ChallengeType.PICTURE,
            points: 75,
            content: 'Take a close-up photo of a rusty metal structure.',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'The Fence',
            description: 'Follow the perimeter.',
            type: ChallengeType.TRIVIA,
            points: 90,
            content: 'What color is the high security fence surrounding the facility?',
            options: ['Green', 'Grey', 'Black', 'Blue'],
            answer: 'Green',
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'Industrial Sound',
            description: 'Listen closely.',
            type: ChallengeType.TRIVIA,
            points: 110,
            content: 'Can you hear the hum of the plant? What does it sound like?',
            options: ['Humming', 'Banging', 'Whistling', 'Silence'],
            answer: 'Humming',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(tataTour.id, tataTourChallenges);


    // --- TOUR 2: Barcelona: Gaudi's Dream (Psychedelic Mode) ---
    const bcnGaudiTour = await prisma.tour.create({
        data: {
            title: 'Gaudi\'s Psychedelic Dream',
            location: 'Barcelona',
            description: 'A mind-bending journey through the organic shapes and colors of Antoni Gaudi. Includes a Sangria stop to enhance the visions.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/barcelona-gaudi-park-guell-2.jpg`,
            distance: 6.5,
            duration: 180,
            points: 1800,
            modes: ['WALKING', 'TRANSIT', 'BINGO', 'PUBGOLF'],
            difficulty: Difficulty.MEDIUM,
            authorId: bob.id,
            startLat: 41.4036,
            startLng: 2.1744,
            status: 'PUBLISHED',
        },
    });

    const bcnGaudiStops = [
        {
            name: 'La Sagrada Familia: The Forest',
            description: 'Enter the stone forest.',
            order: 1,
            number: 1,
            lat: 41.4036,
            lng: 2.1744,
            type: StopType.Monument_Landmark,
            imageUrl: 'https://images.unsplash.com/photo-1562947097-9e4a3a609d9c?auto=format&fit=crop&w=800&q=80',
            detailedDescription: 'Gaudi intended the interior to feel like a forest. The columns branch out like trees, and the light filtering through the stained glass creates a dappled sunlight effect. It is a masterpiece of biomimicry.',
            challenges: [
                {
                    title: 'Light Spectrum',
                    description: 'Observe the stained glass.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'Which color dominates the stained glass on the Nativity facade side (East)?',
                    options: ['Blue/Green', 'Red/Orange', 'Yellow/Gold', 'Purple'],
                    answer: 'Blue/Green', // Harder observation
                },
                {
                    title: 'Magic Square',
                    description: 'Find the number grid.',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'On the Passion facade, there is a magic square. What is the sum of any row or column (the age of Christ at death)?',
                    options: ['33', '30', '40', '12'],
                    answer: '33',
                }
            ]
        },
        {
            name: 'Hospital de Sant Pau',
            description: 'Art Nouveau healing center.',
            order: 2,
            number: 2,
            lat: 41.4115,
            lng: 2.1750,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Tile Pattern',
                    description: 'Look at the roof domes.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Take a close-up photo of the yellow and red roof tiles.',
                }
            ]
        },
        {
            name: 'Park Güell: The Lizard',
            description: 'The iconic mosaic wanderland.',
            order: 3,
            number: 3,
            lat: 41.4150,
            lng: 2.1520,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Lizard\'s Teeth',
                    description: 'Count them (if you can).',
                    type: ChallengeType.TRIVIA,
                    points: 200,
                    content: 'El Drac (the dragonfly/lizard) has water flowing from its mouth. Does it have visible teeth in the mosaic?',
                    options: ['Yes', 'No'],
                    answer: 'Yes',
                },
                {
                    title: 'Selfie with Drac',
                    description: 'Wait for the crowd to clear.',
                    type: ChallengeType.PICTURE,
                    points: 150,
                    content: 'Snap a selfie with the mosaic lizard.',
                }
            ]
        },
        {
            name: 'Casa Vicens',
            description: 'Gaudi\'s first house. Moorish vibes.',
            order: 4,
            number: 4,
            lat: 41.4035,
            lng: 2.1506,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Iron Leaves',
                    description: 'Examine the gate.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'The cast-iron gate is formed by the leaves of what plant?',
                    options: ['Palm', 'Fern', 'Rose', 'Ivy'],
                    answer: 'Palm',
                }
            ]
        },
        {
            name: 'Casa Milà (La Pedrera)',
            description: 'The Quarry.',
            order: 5,
            number: 5,
            lat: 41.3954,
            lng: 2.1620,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Balcony Iron',
                    description: 'Look at the railings.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What material are the balcony railings made of?',
                    options: ['Recycled Scrap Iron', 'Bronze', 'Pure Steel', 'Wood'],
                    answer: 'Recycled Scrap Iron',
                }
            ]
        },
        {
            name: 'Casa Batlló',
            description: 'The House of Bones.',
            order: 6,
            number: 6,
            lat: 41.3917,
            lng: 2.1649,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Bone Count',
                    description: 'Look at the main level columns.',
                    type: ChallengeType.TRIVIA,
                    points: 110,
                    content: 'How many bone-shaped columns support the main "Tribune" window?',
                    options: ['6', '4', '8', '2'],
                    answer: '6', // Count carefully!
                }
            ]
        },
        {
            name: 'El Nacional (Tap Station)',
            description: 'Refreshment break. Time for PubGolf.',
            order: 7,
            number: 7,
            lat: 41.3895,
            lng: 2.1670,
            type: StopType.Food_Dining,
            pubgolfPar: 3,
            pubgolfDrink: 'Sangria Glass',
            challenges: [
                {
                    title: 'Sangria Test',
                    description: 'Taste the fruit.',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'Is there an orange slice in your glass?',
                    options: ['Yes', 'No'],
                    answer: 'Yes',
                }
            ]
        },
        {
            name: 'Cascada Monumental',
            description: 'A golden finale in the park.',
            order: 8,
            number: 8,
            lat: 41.3888,
            lng: 2.1865,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Golden Quadriga',
                    description: 'Look at the top.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        }
    ];

    await createStopsAndChallenges(bcnGaudiTour.id, bcnGaudiStops);
    await createReviews(bcnGaudiTour.id);

    // Tour-wide Bonus
    const bcnGaudiChallenges = [
        {
            title: 'Street Performer',
            description: 'Tip a statue.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a picture of a "Human Statue" street performer on La Rambla.',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Modernisme',
            description: 'Find a curve.',
            type: ChallengeType.TRIVIA,
            points: 150,
            content: 'Gaudi famously said "The straight line belongs to men, the curved one to..."?',
            options: ['God', 'Nature', 'Women', 'Angels'],
            answer: 'God',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'Mosaic Tile',
            description: 'Spot a blue tile.',
            type: ChallengeType.PICTURE,
            points: 80,
            content: 'Find and photograph a blue mosaic tile (trencadis).',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Dragon Hunt',
            description: 'Find a dragon.',
            type: ChallengeType.TRIVIA,
            points: 120,
            content: 'How many toes does the iron dragon gate at Pavellons Güell have?',
            options: ['3', '4', '5', 'It has claws'],
            answer: 'It has claws',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Chimney Pot',
            description: 'Look up!',
            type: ChallengeType.LOCATION,
            points: 90,
            content: 'Spot a chimney pot shaped like a knight or mushroom.',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Catalan Quote',
            description: 'Read a plaque.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'What language is primarily used on historical plaques here?',
            options: ['Catalan', 'Spanish', 'French', 'English'],
            answer: 'Catalan',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Gothic Font',
            description: 'Read the type.',
            type: ChallengeType.PICTURE,
            points: 70,
            content: 'Photograph a shop sign using a "Modernista" or Gothic style font.',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'Iron Work',
            description: 'Twisted metal.',
            type: ChallengeType.LOCATION,
            points: 110,
            content: 'Find a balcony railing that looks like seaweed or vines.',
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'Stained Glass',
            description: 'Colorful light.',
            type: ChallengeType.PICTURE,
            points: 130,
            content: 'Take a photo of sunlight passing through stained glass.',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(bcnGaudiTour.id, bcnGaudiChallenges);


    // --- TOUR 3: Barcelona: Gothic & Tapas (PubGolf Edition) ---
    const bcnTapasTour = await prisma.tour.create({
        data: {
            title: 'Barcelona: Gothic & Gluttony',
            location: 'Barcelona',
            description: 'Medieval alleys, royal squares, and a lot of wine. This is the ultimate tapas crawl with a PubGolf twist.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/Sagrada_Familia_Sculptures.jpg`,
            distance: 4.0,
            duration: 150,
            points: 1500,
            modes: ['WALKING', 'PUBGOLF', 'BINGO'],
            difficulty: Difficulty.EASY,
            authorId: joey.id,
            startLat: 41.3833,
            startLng: 2.1750,
            status: 'PUBLISHED',
        },
    });

    const bcnTapasStops = [
        {
            name: 'Barcelona Cathedral',
            description: 'Start sober at the Cathedral.',
            order: 1,
            number: 1,
            lat: 41.3840,
            lng: 2.1762,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Geese Count',
                    description: 'Count the birds.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'There are exactly how many white geese in the cloister (hint: age of St. Eulalia)?',
                    options: ['13', '12', '14', '7'],
                    answer: '13',
                }
            ]
        },
        {
            name: 'El Xampanyet',
            description: 'Hole 1: Cava & Anchovies.',
            order: 2,
            number: 2,
            lat: 41.3850,
            lng: 2.1818,
            type: StopType.Food_Dining,
            pubgolfPar: 3,
            pubgolfDrink: 'Cava Glass',
            challenges: [
                {
                    title: 'Cheers!',
                    description: 'Clink glasses.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Take a photo of your group toasting with Cava.',
                }
            ]
        },
        {
            name: 'Santa Maria del Mar',
            description: 'The Sea Cathedral.',
            order: 3,
            number: 3,
            lat: 41.3845,
            lng: 2.1820,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Flame Thrower',
                    description: 'Find the eternal flame.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                }
            ]
        },
        {
            name: 'Bar del Pla',
            description: 'Hole 2: Vermut Time.',
            order: 4,
            number: 4,
            lat: 41.3835,
            lng: 2.1795,
            type: StopType.Food_Dining,
            pubgolfPar: 4,
            pubgolfDrink: 'Vermut Red',
            challenges: [
                {
                    title: 'Olive Spear',
                    description: 'Eat the olive.',
                    type: ChallengeType.DARE,
                    points: 50,
                    content: 'Eat the garnish olive without using your hands.',
                }
            ]
        },
        {
            name: 'Els Quatre Gats',
            description: 'Where Picasso drank.',
            order: 5,
            number: 5,
            lat: 41.3858,
            lng: 2.1735,
            type: StopType.Coffee_Drink,
            challenges: [
                {
                    title: 'Menu Art',
                    description: 'Find the Picasso sketch.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'Picasso designed the menu. What animal is prominent in the cafe\'s name?',
                    options: ['Cat', 'Dog', 'Bull', 'Horse'],
                    answer: 'Cat',
                }
            ]
        },
        {
            name: 'Plaça Reial',
            description: 'Hole 3: Sangria in the square.',
            order: 6,
            number: 6,
            lat: 41.3790,
            lng: 2.1755,
            type: StopType.Nightlife,
            pubgolfPar: 5,
            pubgolfDrink: 'Sangria Pitcher (Share)',
            challenges: [
                {
                    title: 'Lamppost Gaudi',
                    description: 'Look at the lamps.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                },
                {
                    title: 'Palm Tree Selfie',
                    description: 'Find a palm tree.',
                    type: ChallengeType.PICTURE,
                    points: 80,
                    content: 'Take a photo hugging a palm tree in the square.',
                }
            ]
        }
    ];

    await createStopsAndChallenges(bcnTapasTour.id, bcnTapasStops);
    await createReviews(bcnTapasTour.id);

    // Tour-wide Bonus
    const bcnTapasChallenges = [
        {
            title: 'Tapas Tower',
            description: 'Stack your plates.',
            type: ChallengeType.PICTURE,
            points: 150,
            content: 'Build a tower of empty tapas plates/toothpicks.',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Catalan Flag',
            description: 'Spot the stripes.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'How many red stripes are on the Catalan flag (Senyera)?',
            options: ['4', '5', '3', '2'],
            answer: '4',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'Jamón Leg',
            description: 'Ham it up.',
            type: ChallengeType.PICTURE,
            points: 120,
            content: 'Take a photo of a hanging leg of Jamón Ibérico.',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Patatas Bravas',
            description: 'Spicy potatoes.',
            type: ChallengeType.TRIVIA,
            points: 90,
            content: 'What is the key ingredient in "Salsa Brava"?',
            options: ['Paprika', 'Tomato', 'Chili', 'Garlic'],
            answer: 'Paprika',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Street Musician',
            description: 'Spanish Guitar.',
            type: ChallengeType.LOCATION,
            points: 80,
            content: 'Find a street musician playing Spanish guitar within the Gothic Quarter.',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Gargoyle',
            description: 'Look up at the roofs.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Photograph a gargoyle on a medieval building.',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Narrow Alley',
            description: 'Touch both walls.',
            type: ChallengeType.PICTURE,
            points: 150,
            content: 'Take a photo touching both walls of a narrow street simultaneously.',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'Oldest Shop',
            description: 'Find a date.',
            type: ChallengeType.TRIVIA,
            points: 130,
            content: 'Find a shop established before 1900. What does the sign say?',
            options: ['Cereria Subirà', 'Pastisseria Escribà', 'Casa Gispert', 'Any of them'],
            answer: 'Any of them', // Loose trivia
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'Fountain Drink',
            description: 'Water break.',
            type: ChallengeType.LOCATION,
            points: 50,
            content: 'Locate a public drinking fountain (Font de Canaletes style).',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(bcnTapasTour.id, bcnTapasChallenges);


    // --- SEED ACHIEVEMENTS merged into main block at end of file ---

    // Grant some achievements to users (Moved logic or keeping basic placeholders if needed, but easier to do after all created)


    // (User achievement granting moved to end of file)


    // --- TOUR 4: Warsaw: Phoenix City (Vodka Edition) ---
    const warsawTour = await prisma.tour.create({
        data: {
            title: 'Warsaw: Phoenix Rising',
            location: 'Warsaw',
            description: 'A city destroyed and reborn. Explore the history, the sewers of the uprising, and toast to freedom with local vodka.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/Warsaw.png`,
            distance: 5.5,
            duration: 140,
            points: 1600,
            modes: ['WALKING', 'BINGO', 'PUBGOLF'],
            difficulty: Difficulty.HARD,
            authorId: alice.id,
            startLat: 52.2475,
            startLng: 21.0135,
        },
    });

    const warsawStops = [
        {
            name: 'Sigismund\'s Column',
            description: 'The meeting point. King of the castle.',
            order: 1,
            number: 1,
            lat: 52.2475,
            lng: 21.0135,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Sword Hand',
                    description: 'Look at the King.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'In which hand does King Sigismund hold his sword?',
                    options: ['Right', 'Left', 'Both', 'None'],
                    answer: 'Right', // Look carefully!
                }
            ]
        },
        {
            name: 'Pijalnia Wódki i Piwa',
            description: 'Hole 1: Communist-style bistro.',
            detailedDescription: 'Step back into the 1960s. This nostalgic bar serves cheap drinks and traditional snacks (herring, tartare) in a retro setting. Time for your first "hole".',
            order: 2,
            number: 2,
            lat: 52.2460,
            lng: 21.0130,
            type: StopType.Nightlife,
            pubgolfPar: 3,
            pubgolfDrink: 'Lemon Vodka Shot',
            challenges: [
                {
                    title: 'Newspaper Reading',
                    description: 'Read the wall clippings.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'The walls are covered in old newspapers. What language are they in?',
                    options: ['Polish', 'Russian', 'German', 'English'],
                    answer: 'Polish',
                }
            ]
        },
        {
            name: 'Royal Castle',
            description: 'Rebuilt from rubble.',
            order: 3,
            number: 3,
            lat: 52.2480,
            lng: 21.0150,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Clock Freeze',
                    description: 'Look at the main tower clock.',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'The clock was stopped when the castle was bombed. At what time?',
                    options: ['11:15', '09:00', '14:30', '17:00'],
                    answer: '11:15',
                }
            ]
        },
        {
            name: 'Old Town Market Place',
            description: 'The Mermaid\'s domain.',
            order: 4,
            number: 4,
            lat: 52.2497,
            lng: 21.0122,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Shield Crest',
                    description: 'Inspect the mermaid shield.',
                    type: ChallengeType.TRIVIA,
                    points: 150,
                    content: 'The Warsaw Mermaid carries a shield. What bird is depicted on the crest of the city?',
                    options: ['Eagle', 'Falcon', 'Dove', 'Hawk'],
                    answer: 'Eagle', // Requires knowledge or close look
                },
                {
                    title: 'Market Selfie',
                    description: 'Pose with the Syrenka.',
                    type: ChallengeType.PICTURE,
                    points: 100,
                    content: 'Take a selfie with the Mermaid statue in the background.',
                }
            ]
        },
        {
            name: 'Warsaw Barbican',
            description: 'The fortress gate.',
            order: 5,
            number: 5,
            lat: 52.2515,
            lng: 21.0105,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Brick Counter',
                    description: 'Find the different brick.',
                    type: ChallengeType.LOCATION,
                    points: 70,
                }
            ]
        },
        {
            name: 'Warsaw Uprising Monument',
            description: 'Heroes of 1944. A solemn stop.',
            order: 6,
            number: 6,
            lat: 52.2493,
            lng: 21.0065,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Sewer Escape',
                    description: 'Look at the soldier entering the manhole.',
                    type: ChallengeType.TRIVIA,
                    points: 110,
                    content: 'The insurgents used the sewers to move across the city. What is the Polish word for sewer shown on maps nearby?',
                    options: ['Kanał', 'Rura', 'Woda', 'Metro'],
                    answer: 'Kanał',
                }
            ]
        },
        {
            name: 'Holy Cross Church',
            description: 'Chopin\'s Heart.',
            order: 7,
            number: 7,
            lat: 52.2390,
            lng: 21.0175,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Pillar Search',
                    description: 'Find the heart pillar.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        },
        {
            name: 'Palace of Culture',
            description: 'Hole 2: Rooftop toast.',
            order: 8,
            number: 8,
            lat: 52.2317,
            lng: 21.0060,
            type: StopType.Viewpoint,
            pubgolfPar: 4,
            pubgolfDrink: 'Cocktail/Beer at Top',
            challenges: [
                {
                    title: 'Empire State',
                    description: 'Compare heights.',
                    type: ChallengeType.TRUE_FALSE,
                    points: 90,
                    content: 'Is this building taller than the Empire State Building?',
                    answer: 'false',
                }
            ]
        }
    ];

    await createStopsAndChallenges(warsawTour.id, warsawStops);
    await createReviews(warsawTour.id);

    // Bonus
    const warsawChallenges = [
        {
            title: 'Milk Bar',
            description: 'Find a "Bar Mleczny".',
            type: ChallengeType.PICTURE,
            points: 150,
            content: 'Take a photo of a traditional "Bar Mleczny" sign.',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Composer',
            description: 'Find a bench.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'Which famous composer has musical benches scattered around Warsaw?',
            options: ['Chopin', 'Beethoven', 'Mozart', 'Bach'],
            answer: 'Chopin',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'Dumpling Love',
            description: 'Eat a Pierogi.',
            type: ChallengeType.DARE,
            points: 120,
            content: 'Order and eat a Pierogi with your hands (no fork).',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Siren Symbol',
            description: 'Find the Mermaid.',
            type: ChallengeType.LOCATION,
            points: 80,
            content: 'Locate a representation of the Warsaw Mermaid (Syrenka) on a building or flag.',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Rebuilt Date',
            description: 'Check a reconstruction plaque.',
            type: ChallengeType.TRIVIA,
            points: 90,
            content: 'Many Old Town buildings have dates like 1953 or 1955. Find one.',
            options: ['Found one', 'Can\'t find'],
            answer: 'Found one',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Vodka Clear',
            description: 'Toast with Wodka.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a group selfie raising a shot/glass of clear liquid.',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Neon Sign',
            description: 'Warsaw loves Neon.',
            type: ChallengeType.PICTURE,
            points: 110,
            content: 'Photograph an old-school Neon sign.',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'Royal Crown',
            description: 'Spot a crown symbol.',
            type: ChallengeType.LOCATION,
            points: 70,
            content: 'Find a crown symbol on a lamppost or gate.',
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'River View',
            description: 'See the Vistula.',
            type: ChallengeType.LOCATION,
            points: 60,
            content: 'Go to a point where you can see the Vistula river.',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(warsawTour.id, warsawChallenges);


    // --- TOUR 5: Amsterdam Canals & Culture (Expanded) ---
    const amsterdamTour = await prisma.tour.create({
        data: {
            title: 'Amsterdam Canals & Culture',
            location: 'Amsterdam',
            description: 'Go beyond the Red Light District and explore the diverse architecture, hidden gems, and new icons of Amsterdam.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/RedLightDistrict.png`,
            distance: 7.5,
            duration: 180,
            points: 1300,
            modes: ['WALKING', 'BIKING', 'BINGO', 'PUBGOLF'],
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
            detailedDescription: 'Het Schip gives a whole new meaning to "public housing." Designed by Michel de Klerk in the expressionist Amsterdam School style, this apartment block was built for the working class but looks like a luxurious ocean liner. Its unconventional shapes, towers, and decorative brickwork make it one of the most unique architectural landmarks in Amsterdam.',
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
            detailedDescription: 'NDSM Wharf is Amsterdam’s raw, creative beating heart. Once a massive shipyard, it is now a post-industrial playground for artists, festivals, and startups. The derelict warehouses are covered in ever-changing street art, and the area buzzes with a gritty, unpolished energy that contrasts sharply with the manicured canals of the city center.',
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
            detailedDescription: 'The EYE Film Museum is a striking piece of modern architecture on the banks of the IJ river. Its sleek, white, geometric design resembles a giant eye or perhaps a spaceship. Inside, it houses a massive collection of Dutch and international films, posters, and equipment, celebrating the art of cinema in a setting that is a visual spectacle in itself.',
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
            detailedDescription: 'The A\'DAM Lookout offers an unrivaled 360-degree view of Amsterdam, from the historic center to the polders north of the city. For the thrill-seekers, it features "Over the Edge," Europe\'s highest swing. You can dangle 100 meters above the ground, back and forth over the edge of the tower, with the city sprawled out beneath your feet.',
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
            detailedDescription: 'NEMO Science Museum is impossible to miss. Designed by Renzo Piano, this green, copper-clad building rises out of the water like the bow of a giant ship. It is the largest science center in the Netherlands, designed to be hands-on and interactive. The sloping roof doubles as a public piazza, offering a fantastic city terrace for locals and visitors alike.',
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
            detailedDescription: 'The Scheepvaartmuseum is housed in a former naval storehouse from 1656. It tells the story of how the sea has shaped Dutch culture and history. Moored outside is a full-scale replica of the "Amsterdam," an 18th-century East Indiaman ship that perished on its maiden voyage. Exploring the decks gives a visceral sense of life during the Dutch Golden Age of exploration.',
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
            detailedDescription: 'The Python Bridge (officially the High Bridge) corresponds to its nickname perfectly. This bright red, undulating footbridge spans the canal connecting Sporenburg to Borneo Island. Its wave-like shape is not just artistic but functional, allowing sufficient clearance for boats underneath. Walking over its steep humps is a workout with a view!',
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
            detailedDescription: 'Brouwerij \'t IJ offers the quintessential Dutch experience: drinking craft beer next to a windmill. Located in a former bathhouse next to the De Gooyer windmill, this brewery produces some of Amsterdam\'s most beloved organic beers. The terrace is a popular local hangout, perfect for sipping a Zatte or Natte while admiring the wooden sails of the mill.',
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

    // Bonus: Amsterdam Bingo
    const amsChallenges = [
        {
            title: 'Red Windows',
            description: 'Find the red glow.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'In the Red Light District, blue lights indicate what?',
            options: ['Transgender Workers', 'Police Station', 'Bar', 'Private Home'],
            answer: 'Transgender Workers',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Canal Bike',
            description: 'Spot a sunken treasure.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a picture of a bicycle being fished out or locked precariously to a bridge.',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'XXX Symbol',
            description: 'City Coat of Arms.',
            type: ChallengeType.LOCATION,
            points: 50,
            content: 'Find the three Saint Andrew\'s Crosses (XXX) on a bollard.',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Heineken Star',
            description: 'Spot the red star.',
            type: ChallengeType.PICTURE,
            points: 80,
            content: 'Photograph the Heineken logo.',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Narrow House',
            description: 'Find the thinnest facade.',
            type: ChallengeType.LOCATION,
            points: 120,
            content: 'Locate a house that is only one window wide.',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Bike Traffic',
            description: 'Dodging bikes.',
            type: ChallengeType.TRIVIA,
            points: 70,
            content: 'Approximately how many bicycles are in Amsterdam?',
            options: ['880,000', '500,000', '1 Million', '200,000'],
            answer: '880,000',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Cheese Sample',
            description: 'Free snack.',
            type: ChallengeType.DARE,
            points: 60,
            content: 'Go into a cheese shop and try a sample.',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'Houseboat',
            description: 'Living on water.',
            type: ChallengeType.PICTURE,
            points: 90,
            content: 'Take a photo of a houseboat with a garden.',
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'Flower Market',
            description: 'Smell the tulips.',
            type: ChallengeType.LOCATION,
            points: 50,
            content: 'Find a stall selling Tulip bulbs.',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(amsterdamTour.id, amsChallenges);


    // --- TOUR 6: Breda PubGolf Championship ---
    const bredaTour = await prisma.tour.create({
        data: {
            title: 'Breda PubGolf Championship',
            location: 'Breda',
            description: 'The ultimate pub golf experience in the pearl of the south. 12 holes, 12 drinks, one champion.',
            imageUrl: `${SUPABASE_URL}/storage/v1/object/public/images/tours/PubgolfBreda.png`,
            distance: 3.5,
            duration: 240, // 4 hours
            points: 2000,
            modes: ['PUBGOLF', 'WALKING', 'BINGO'],
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
            detailedDescription: 'Welcome to De Beyerd, a Breda institution since 1838. This family-run beer café is famous for its hospitality and its very own brewery. Start your Pub Golf round here with their signature "Drie Hoefijzers Klassiek" or another specialty brew. The warm, brown café interior sets the perfect relaxed tone before the competition heats up.',
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
            detailedDescription: 'Café de Bruine Pij looks exactly like a pub should: dark wood, dim lights, and buzzing with conversation. Located right at the foot of the Grote Kerk (Great Church), it offers a stunning view from the terrace. Enjoy a perfectly poured flute of pilsner as you soak up the lively atmosphere of the Grote Markt during this par-4 hole.',
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
            detailedDescription: '\'t Hart van Breda is known for two things: "Gezelligheid" (that untranslatable Dutch coziness) and their legendary nachos. It\'s a student favorite and a great spot to refuel. For this hole, sit back with a refreshing white wine or witbier. The par is 3, so keep the pace steady but enjoyable.',
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
            detailedDescription: 'De Bommel is where the night often shifts gear. It\'s a place where the music gets a bit louder and the crowd a bit rowdier. Hole 4 is a "Short" hole—a par 2. That means it\'s time for a shot! Salmiakki (Salmari) is the local favorite—a licorice liqueur that packs a punch but goes down smooth.',
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
            detailedDescription: 'Take a short walk to the harbor for Dok 19. This spot is a haven for craft beer lovers, with an impressive selection on tap and in bottles. The vibe is laid-back and alternative. Sip on a hoppy IPA while looking out over the water. It\'s a par 5, designed to be a "long" hole, so take your time and enjoy the complex flavors.',
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
            detailedDescription: 'Proost is more than a pub; it\'s a mini-club. By now, you might be ready to hit the dance floor. The drink of choice here is a refreshing Gin & Tonic. It\'s a par 3, offering a crisp break from the beers. Let the music energize you as you head into the back nine of the course.',
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
            detailedDescription: 'Dependance is located on the Vismarktstraat, the main artery of Breda\'s nightlife. It\'s a classic party pub where the sing-alongs are mandatory. You\'re back on the pilsner here, but this time it\'s a pint. It\'s a par 4, so pace yourself amongst the swaying crowd.',
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
            detailedDescription: 'Walkabout brings the Outback to Breda. It\'s an Australian-themed sports bar known for its friendly staff and laid-back attitude. The challenge here is a "Snakebite"—a mix of lager, cider, and blackcurrant. It\'s sweet, dangerous, and delicious. A par 3 to keep spirits high.',
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
            detailedDescription: 'Coyote Breda is inspired by the famous "Coyote Ugly" movie. Expect bartenders dancing on the bar and a wild party atmosphere. Hole 9 calls for a Tequila shot. Salt, shot, lime—par 2. Get it done and join the party on the bar (if you dare)!',
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
            detailedDescription: 'Peddels claims to be one of the smallest party pubs in Breda. It gets packed, intimate, and incredibly sweaty. The challenge here is a "Pitcher" to share with your team (or tackle alone if you\'re brave/foolish). It\'s a par 5 because it takes teamwork and time to get through it in such a crushed environment.',
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
            detailedDescription: 'Studio depends on when you arrive—it can be a chill cafe or a pumping nightspot. As you near the end of the course, we need a boost. Vodka Redbull is the drink of choice for Hole 11. The caffeine and sugar kick is exactly what you need to power through to the final hole.',
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
            detailedDescription: 'Holy Moly is an "Experience Bar"—it\'s like stepping into a bizarre, trippy wonderland with hidden rooms and crazy decor (look for the tree!). This is the clubhouse. Order a celebratory cocktail to finish your round. Reflect on the night, tally your scores, and crown the Pub Golf Champion of Breda!',
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

    // Bonus: Breda Bingo
    const bredaChallenges = [
        {
            title: 'Carnival Scarf',
            description: 'Find the Orange/Purple scarf.',
            type: ChallengeType.TRIVIA,
            points: 100,
            content: 'Breda\'s Carnival colors are Orange and Purple. What do you see hanging in most bars?',
            options: ['Scarves', 'Hats', 'Flags', 'Shoes'],
            answer: 'Scarves',
            bingoRow: 0,
            bingoCol: 0,
        },
        {
            title: 'Grote Kerk',
            description: 'Selfie with the tower.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a selfie with the church tower visible behind you.',
            bingoRow: 0,
            bingoCol: 1,
        },
        {
            title: 'Blind Wall',
            description: 'Street Art.',
            type: ChallengeType.PICTURE,
            points: 120,
            content: 'Photograph a "Blind Walls Gallery" mural.',
            bingoRow: 0,
            bingoCol: 2,
        },
        // Row 1
        {
            title: 'Nassau History',
            description: 'Royal roots.',
            type: ChallengeType.TRIVIA,
            points: 80,
            content: 'Breda is a "Nassau City". Which royal family originated here?',
            options: ['Oranje-Nassau', 'Windsor', 'Bourbon', 'Habsburg'],
            answer: 'Oranje-Nassau',
            bingoRow: 1,
            bingoCol: 0,
        },
        {
            title: 'Begijnhof',
            description: 'Silence please.',
            type: ChallengeType.LOCATION,
            points: 90,
            content: 'Find the entrance to the Begijnhof.',
            bingoRow: 1,
            bingoCol: 1,
        },
        {
            title: 'Spanjaardsgat',
            description: 'Water gate.',
            type: ChallengeType.LOCATION,
            points: 70,
            content: 'Locate the Spaniard\'s Hole (water gate).',
            bingoRow: 1,
            bingoCol: 2,
        },
        // Row 2
        {
            title: 'Park Valkenberg',
            description: 'Chicken or Rooster?',
            type: ChallengeType.TRIVIA,
            points: 60,
            content: 'There are roaming chickens in the park. True or False?',
            options: ['True', 'False'],
            answer: 'True',
            bingoRow: 2,
            bingoCol: 0,
        },
        {
            title: 'Chasse Theatre',
            description: 'Modern roof.',
            type: ChallengeType.PICTURE,
            points: 110,
            content: 'Take a photo of the wavy roof of the Chasse Theatre.',
            bingoRow: 2,
            bingoCol: 1,
        },
        {
            title: 'Market Day',
            description: 'Grote Markt.',
            type: ChallengeType.DARE,
            points: 50,
            content: 'Sit on a terrace at the Grote Markt and wave at a stranger.',
            bingoRow: 2,
            bingoCol: 2,
        }
    ];
    await createTourChallenges(bredaTour.id, bredaChallenges);



    // --- Achievements ---
    console.log('Seeding achievements...');
    const achievements = [
        {
            title: 'First Steps',
            description: 'Complete your first tour',
            icon: 'flag', // Simple start
            color: '#4ADE80', // Green
            criteria: 'TOUR_COMPLETION',
            target: 1,
            xpReward: 100,
        },
        {
            title: 'Tour Master',
            description: 'Complete 5 tours',
            icon: 'trophy',
            color: '#F59E0B', // Amber
            criteria: 'TOUR_COMPLETION',
            target: 5,
            xpReward: 500,
        },
        {
            title: 'Social Butterfly',
            description: 'Add a friend',
            icon: 'people',
            color: '#EC4899', // Pink
            criteria: 'FRIEND_ADD',
            target: 1,
            xpReward: 50,
        },
        {
            title: 'Squad Goals',
            description: 'Add 5 friends',
            icon: 'people',
            color: '#DB2777', // Darker Pink
            criteria: 'FRIEND_ADD',
            target: 5,
            xpReward: 250,
        },
        {
            title: 'Sharpshooter',
            description: 'Get a Hole in One on PubGolf',
            icon: 'star',
            color: '#FACC15', // Yellow
            criteria: 'PUBGOLF_HOLE_IN_ONE',
            target: 1,
            xpReward: 150,
        },
        {
            title: 'On Fire',
            description: 'Get 3 Hole in Ones in a single game',
            icon: 'flame',
            color: '#EF4444', // Red
            criteria: 'PUBGOLF_STREAK',
            target: 3,
            xpReward: 1000,
        },
        {
            title: 'Explorer',
            description: 'Visit 10 unique stops',
            icon: 'map',
            color: '#3B82F6', // Blue
            criteria: 'STOP_VISIT',
            target: 10,
            xpReward: 200,
        },
        {
            title: 'Party Animal',
            description: 'Complete a tour with a team of 4+',
            icon: 'flash',
            color: '#8B5CF6', // Purple
            criteria: 'TEAM_SIZE',
            target: 4,
            xpReward: 300,
        },
        {
            title: 'Veteran',
            description: 'Reach Level 5',
            icon: 'trophy',
            color: '#6366F1', // Indigo
            criteria: 'LEVEL_REACH',
            target: 5,
            xpReward: 500,
        },
        {
            title: 'Critic',
            description: 'Leave a review',
            icon: 'star',
            color: '#10B981', // Emerald
            criteria: 'REVIEW_LEAVE',
            target: 1,
            xpReward: 100,
        },
        {
            title: 'Creator',
            description: 'Create your first tour',
            icon: 'map',
            color: '#9C27B0', // Purple
            criteria: 'creator',
            target: 1,
            xpReward: 300
        },
        {
            title: 'First Tour',
            description: 'Complete your first tour',
            icon: 'rocket',
            color: '#F472B6', // Pink
            criteria: 'first-tour',
            target: 1,
            xpReward: 200,
        }
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: {
                title: ach.title,
                description: ach.description,
                icon: ach.icon,
                color: ach.color,
                criteria: ach.criteria,
                target: ach.target,
                xpReward: ach.xpReward,
            }
        });
    }

    // Give Joey some achievements
    const allAchievements = await prisma.achievement.findMany();
    if (allAchievements.length > 0) {
        // Give 3 random achievements
        const shuffled = allAchievements.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        for (const ach of selected) {
            await prisma.userAchievement.create({
                data: {
                    userId: joey.id,
                    achievementId: ach.id,
                }
            });
        }
    }

    // --- Mock Active Tour for Dev ---
    // Start the Breda tour for Joey
    // 1. Fetch full tour data to link correct IDs
    const fullBredaTour = await prisma.tour.findUnique({
        where: { id: bredaTour.id },
        include: { stops: true, challenges: true }
    });

    if (fullBredaTour) {
        const activeTour = await prisma.activeTour.create({
            data: {
                id: 112233445,
                tourId: fullBredaTour.id,
                status: SessionStatus.IN_PROGRESS,
            },
        });

        const team = await prisma.team.create({
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

        // Create Bingo Card
        const bingoChallenges = fullBredaTour.challenges.filter(c => c.bingoRow !== null && c.bingoCol !== null);
        if (bingoChallenges.length > 0) {
            const bingoCard = await prisma.bingoCard.create({
                data: { teamId: team.id }
            });
            /*
            // BingoCell model does not exist in schema
            await prisma.bingoCell.createMany({
                data: bingoChallenges.map(c => ({
                    bingoCardId: bingoCard.id,
                    challengeId: c.id,
                    row: c.bingoRow!,
                    col: c.bingoCol!
                }))
            });
            */
        }

        // Create PubGolf Stops
        const pubGolfStops = fullBredaTour.stops.filter(s => s.pubgolfPar !== null);
        if (pubGolfStops.length > 0) {
            await prisma.pubGolfStop.createMany({
                data: pubGolfStops.map(s => ({
                    teamId: team.id,
                    stopId: s.id,
                    sips: 0
                }))
            });
        }
    }

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
