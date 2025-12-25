import { PrismaPg } from '@prisma/adapter-pg';
import { ChallengeType, Difficulty, PrismaClient, SessionStatus, StopType } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';
import 'dotenv/config';
import { Pool } from 'pg';

console.log('DATABASE_URL connection string:', `"${process.env.DATABASE_URL}"`);
console.log('DIRECT_URL connection string:', `"${process.env.DIRECT_URL}"`);

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from environment variables');
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hashPassword = (password: string) => {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hashedPassword}`;
};

async function main() {
    console.log('Start seeding ...');

    // Clean up existing data
    await prisma.userPlayedTour.deleteMany();
    await prisma.notification.deleteMany();
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
                    // No stopId
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
            imageUrl: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9bf9?auto=format&fit=crop&w=800&q=80',
            detailedDescription: 'The Main Gate is the historic entry point to the massive steelworks. Established in 1918, the Hoogovens Museum preserves the rich history of steelmaking in the region. Here you can see original machinery, photos of the early days, and understand the impact of the industry on the local community.',
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
            detailedDescription: 'From this vantage point, you can safely observe Blast Furnace 6. This unit, although older, is a testament to the longevity of industrial engineering. Watch closely for the steam vents—these are crucial safety mechanisms that release excess pressure and heat. The steam is often visible from miles away, acting as a beacon of industry in the IJmuiden skyline.',
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
            detailedDescription: 'Blast Furnace 7 is the crown jewel of the Tata Steel site. Standing over 80 meters tall, it operates 24/7, reaching internal temperatures of over 2000°C. Here, raw iron ore is smelted with coke and limestone to produce liquid iron, which is then transported in torpedo ladles to the steel plant. It is a terrifying yet awe-inspiring display of human mastery over elements.',
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
            detailedDescription: 'The Coking Plant is where coal is baked at high temperatures in the absence of oxygen to create "coke"—a pure carbon fuel essential for the blast furnaces. The most dramatic moment is "quenching," where the red-hot coke is cooled with water, releasing the massive white steam clouds you see dominating the horizon.',
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
            detailedDescription: 'This deep-water harbor connects the steelworks directly to the North Sea. Enormous bulk carrier ships from Brazil, Australia, and Canada dock here to offload iron ore and coal. The giant blue unloading cranes are capable of moving tons of material in a single scoop, feeding the conveyor belts that snake across the entire industrial terrain.',
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
            detailedDescription: 'The Rolling Mills act like a giant pasta maker for steel. Glowing hot slabs of steel, thick as a mattress, are passed through heavy rollers until they become sheets as thin as a car door or a soup can. The Hot Strip Mill alone is nearly a kilometer long to accommodate the cooling and rolling process.',
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
            detailedDescription: 'Reyndersweg offers a stark contrast between nature and industry. On one side, the waves of the North Sea crash against the shore, attracting surfers and kiteboarders. On the other, the monolithic silhouette of the steelworks looms. It is a unique interface zone where distinct worlds collide, offering beautiful yet dystopian photo opportunities.',
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
            detailedDescription: 'Hidden in the dunes are the concrete scars of World War II. These bunkers were part of the Atlantic Wall, a coastal defense system built by Nazi Germany. The steelworks themselves were a strategic asset and target during the war. Exploring these ruins offers a somber reminder of the area’s turbulent past amidst the modern industrial growth.',
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

    const tataTourChallenges = [
        {
            title: 'Industrial Spy',
            description: 'Spot a train.',
            type: ChallengeType.TRIVIA,
            points: 150,
            content: 'How many torpedo cars (liquid iron transport) did you spot during the tour?',
            options: ['0-2', '3-5', 'More than 5'],
            answer: 'More than 5',
        },
        {
            title: 'Safety First',
            description: 'Find a safety sign.',
            type: ChallengeType.PICTURE,
            points: 100,
            content: 'Take a picture of a "Safety First" or warning sign anywhere on the site.',
        }

    ];
    await createTourChallenges(tataTour.id, tataTourChallenges);


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
            detailedDescription: 'La Sagrada Familia is Antoni Gaudí’s crowning achievement, a project he worked on for 43 years until his death. Combining Gothic and Art Nouveau forms, it mimics nature with tree-like columns and organic shapes. The basilica has been under construction since 1882 and is financed entirely by private donations and ticket sales. Each facade tells a different biblical story, from the joy of the Nativity to the stark sorrow of the Passion.',
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
            detailedDescription: 'While Gaudí gets the spotlight, the Hospital de Sant Pau by Lluís Domènech i Montaner is a masterpiece of Art Nouveau. It was designed as a "garden city" for the sick, believing that beauty and nature aid healing. Its colorful ceramic domes and intricate mosaics make it one of the most beautiful hospital complexes in the world, now a UNESCO World Heritage site.',
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
            detailedDescription: 'The entrance to Park Güell feels like stepping into a fairy tale. The two gatehouses, originally the porter’s lodge and thewaiting room, feature roofs covered in "trencadís" (broken tile mosaics) that resemble gingerbread houses with icing. This playful architecture sets the tone for the park, which was originally intended to be a luxury housing estate for Barcelona’s elite.',
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
            detailedDescription: 'At the heart of the Dragon Stairway sits "El Drac," the iconic mosaic salamander that has become a symbol of Barcelona. It guards the fountain and represents the alchemical element of fire. Visitors from around the world come to marvel at its vibrant colors and snap a photo with this friendly guardian of the park.',
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
            detailedDescription: 'Casa Vicens is the first house designed by Gaudí and marks the beginning of his illustrious career. Built as a summer home, it displays a heavy Neo-Mudéjar (Moorish revival) influence, featuring vibrant green and cream tiles, angular towers, and lush garden motifs. It stands as a colorful testament to Gaudí’s early genius before he fully developed his signature organic style.',
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
            detailedDescription: 'Casa Milà, popularly known as "La Pedrera" (The Stone Quarry) due to its rough, undulating limestone facade, was Gaudí’s last private residence design. It is structural innovation at its finest, featuring a self-supporting stone facade and free-plan floors. The rooftop is a sculpture garden in itself, where the chimneys look like medieval knights standing guard.',
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
            detailedDescription: 'Casa Batlló is often called the "House of Bones" because of its visceral, skeletal appearance. The balconies look like skull fragments, and the supporting pillars resemble human bones. The roof is arched like the back of a dragon, with shiny scales of ceramic tiles, representing the legend of Saint George (patron saint of Catalonia) slaying the dragon.',
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
            detailedDescription: 'Before he was a master architect, a young Antoni Gaudí worked as an assistant on this monumental fountain in Parc de la Ciutadella. Modeled after the treble fountain in Rome, the Cascada Monumental features a triumphant arch and a golden chariot of Aurora at the top. It is a stunning example of 19th-century classicism with early touches of the brilliance Gaudí would later unleash.',
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
            detailedDescription: 'The Cathedral of the Holy Cross and Saint Eulalia is the spiritual center of the Gothic Quarter. Construction began in the 13th century and took centuries to complete. Unlike Sagrada Familia, this is a prime example of classic Catalan Gothic architecture. Its cloister is famous for housing 13 white geese, representing the age of Saint Eulalia when she was martyred.',
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
            detailedDescription: 'Plaça del Rei (King’s Square) is arguably the best-preserved medieval square in Barcelona. It is surrounded by the Palau Reial Major, the residence of the Counts of Barcelona. It is said that Christopher Columbus was received here by King Ferdinand and Queen Isabella after his first voyage to the Americas. The steps you stand on echo with centuries of royal history.',
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
            detailedDescription: 'El Xampanyet, named after its sparkling house wine, is a Barcelona institution. Dating back to 1929, it has retained its old-world charm with blue tiled walls and marble tables. It is chaotic, loud, and utterly authentic. It is the perfect place to experience the Catalan tradition of "vermut" or an evening aperitif accompanied by fresh anchovies.',
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
            detailedDescription: 'Santa Maria del Mar is a unique church built entirely by the parishioners of the port area—sailors, porters, and fishermen—in the 14th century. Unlike other churches built by royalty, this is the "church of the people." Its soaring columns are spaced wide apart, creating a sense of openness and unity. Its construction story was immortalized in the novel "Cathedral of the Sea."',
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
            detailedDescription: 'The Mercat de Santa Caterina sits on the site of an old convent and stands out for its spectacular undulating roof. The roof is covered in 325,000 colorful ceramic tiles arranged to look like a pixelated fruit and vegetable market when viewed from the air. It is a brilliant fusion of modern architecture and traditional market culture, offering fresh produce and delicious food stalls.',
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
            detailedDescription: 'Els Quatre Gats ("The Four Cats") opened in 1897 modeled after Le Chat Noir in Paris. It became the gathering place for Barcelona\'s modernist artists, including a young Pablo Picasso. In fact, Picasso held his very first solo exhibition here and even designed the menu cover. Stepping inside is like stepping back into the bohemian artistic revolution of the turn of the century.',
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
            detailedDescription: 'Plaça de Sant Jaume has been the political heart of the city since the Roman era when it was the main forum. Today, it is flanked by the two most important government buildings: the Palace of the Generalitat (Catalan Government) and the City Hall of Barcelona. It is often the site of major protests, celebrations, and the famous "castellers" (human towers) during festivals.',
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
            detailedDescription: 'Can Culleretes holds the title of the oldest restaurant in Barcelona and the second oldest in all of Spain, established in 1786. Its walls are lined with oil paintings and photos of celebrities who have dined there over the centuries. It serves traditional Catalan cuisine, keeping recipes alive that have delighted patrons for over 230 years.',
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
            detailedDescription: 'Sigismund\'s Column, erected in 1644, is the oldest secular monument in Warsaw. It commemorates King Sigismund III Vasa, who moved the capital from Kraków to Warsaw. The statue stands 22 meters high and has survived wars and uprisings, though it was rebuilt after WWII. It is the classic meeting point for locals and the symbolic gateway to the Old Town.',
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
            detailedDescription: 'The Royal Castle was the official residence of Polish monarchs. Like most of Warsaw, it was completely destroyed during World War II but was meticulously rebuilt between 1971 and 1984 using brick rubble from the original structure. It is a symbol of Polish resilience and pride, showcasing lavish interiors, including the Throne Room and the Canaletto Room.',
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
            detailedDescription: 'The Old Town Market Place dates back to the 13th century. Once the center of commercial life, it was reduced to rubble in 1944. Its reconstruction was so faithful that it earned a place on the UNESCO World Heritage list. At its center stands the Syrenka (Mermaid), the armed protector and symbol of Warsaw, ready to defend the city with her sword and shield.',
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
            detailedDescription: 'The Warsaw Barbican is a semicircular fortified outpost that was once part of the city\'s historic walls. Built in 1540, it is one of the few remaining relics of the complex network of fortifications that once encircled Warsaw. Today, it serves as a bridge between the Old Town and the New Town, often hosting street artists and musicians.',
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
            detailedDescription: 'The Warsaw Uprising Monument is a moving tribute to the thousands of insurgents who fought against Nazi occupation in 1944. The monument depicts two groups of soldiers: one charging courageously into battle, and another descending into the sewers, which were used as escape routes. It honors the ultimate sacrifice made by the city\'s residents for their freedom.',
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
            detailedDescription: 'Warsaw is the city of Chopin, and his presence is felt everywhere. This multimedia bench is one of several scattered along the Royal Route. Press the button to listen to a snippet of his compositions while taking in the view of Krakowskie Przedmieście, the most prestigious street in the city, lined with aristocratic palaces and historic churches.',
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
            detailedDescription: 'The Holy Cross Church is a Baroque masterpiece with a deeply moving secret. While Frédéric Chopin is buried in Pére Lachaise Cemetery in Paris, his final wish was for his heart to return to his beloved Poland. It is hermetically sealed in a jar of cognac and enshrined within a pillar of this church, a potent symbol of Polish romantic nationalism.',
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
            detailedDescription: 'The Palace of Culture and Science is the tallest building in Poland and a controversial symbol of the Soviet era. "Gifted" by Stalin to the people of Poland in the 1950s, it is a classic example of Socialist Realist architecture. Despite its complicated history, it houses theaters, museums, cinemas, and a popular observation deck on the 30th floor offering panoramic views of the city.',
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
