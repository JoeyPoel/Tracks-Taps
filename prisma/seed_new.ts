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

    // --- TOUR 1: Tata Steel Industrial Safari ---
    const tataTour = await prisma.tour.create({
        data: {
            title: 'Tata Steel Industrial Safari',
            location: 'IJmuiden',
            description: 'Explore the massive industrial landscape of Tata Steel. Discover the raw power of steel production, the history of the Hoogovens, and the complex relationship between industry and nature.',
            imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', // Reliable Industrial Image
            distance: 12.5,
            duration: 90, // Driving/Biking
            points: 1200,
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
            description: 'The historic entrance to the steelworks. Start here to learn about the origins of the Royal Blast Furnaces.',
            order: 1,
            number: 1,
            lat: 52.4690,
            lng: 4.6042,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Blast from the Past',
                    description: 'Look at the historic photos outside the museum.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'In what year was the "Koninklijke Hoogovens" founded?',
                    options: ['1918', '1924', '1945', '1900'],
                    answer: '1918',
                },
                {
                    title: 'Gatekeeper',
                    description: 'Check in at the main gate reception.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                }
            ]
        },
        {
            name: 'Blast Furnace 7',
            description: 'The heart of the operation. This massive structure converts iron ore into liquid iron.',
            order: 2,
            number: 2,
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
            order: 3,
            number: 3,
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
                    content: 'Why is coal converted into coke for steelmaking?',
                    options: ['To burn hotter', 'To remove impurities', 'To make it liquid', 'To add carbon'],
                    answer: 'To burn hotter',
                }
            ]
        },
        {
            name: 'North Sea Canal Harbor',
            description: 'Where raw materials arrive from all over the world. Massive cranes unload iron ore and coal.',
            order: 4,
            number: 4,
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
            name: 'Dunes & Industry',
            description: 'The edge where the factory meets the protected dune reserve.',
            order: 5,
            number: 5,
            lat: 52.4850,
            lng: 4.5900,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Nature\'s Resilience',
                    description: 'Find the walking path entrance.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                },
                {
                    title: 'Environmental Balance',
                    description: 'Observation challenge.',
                    type: ChallengeType.TRIVIA,
                    points: 90,
                    content: 'What type of specialized filter system is visible on the newer stacks?',
                    options: ['De-NOx', 'Scrubbers', 'Cyclones', 'Electrostatic'],
                    answer: 'De-NOx',
                }
            ]
        }
    ];

    await createStopsAndChallenges(tataTour.id, tataStops);


    // --- TOUR 2: Historic Utrecht Canals & Secrets ---
    const utrechtTour = await prisma.tour.create({
        data: {
            title: 'Historic Utrecht Canals',
            location: 'Utrecht',
            description: 'Wander along the Oudegracht and discover hidden courtyards, ancient wharf cellars, and the secrets of the Dom City.',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/The_Oudegracht_in_Utrecht_with_the_Dom_Tower_in_the_background.jpg/1024px-The_Oudegracht_in_Utrecht_with_the_Dom_Tower_in_the_background.jpg',
            distance: 4.5,
            duration: 120,
            points: 600,
            modes: ['WALKING'],
            difficulty: Difficulty.MEDIUM,
            authorId: bob.id,
            startLat: 52.0907,
            startLng: 5.1214,
        },
    });

    const utrechtStops = [
        {
            name: 'Dom Tower Underpass',
            description: 'The portal to the city center. Walk through the archway of the tallest church tower.',
            order: 1,
            number: 1,
            lat: 52.0907,
            lng: 5.1214,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Height Check',
                    description: 'Look up!',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'How many steps does it take to climb to the top?',
                    options: ['465', '395', '512', '280'],
                    answer: '465',
                }
            ]
        },
        {
            name: 'Pandhof of the Dom',
            description: 'A hidden medieval monastery garden with beautiful flora and gothic architecture.',
            order: 2,
            number: 2,
            lat: 52.0910,
            lng: 5.1225,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Secret Garden',
                    description: 'Find the fountain in the center.',
                    type: ChallengeType.LOCATION,
                    points: 75,
                },
                {
                    title: 'Gargoyle Spotting',
                    description: 'Look at the roof gutters.',
                    type: ChallengeType.TRIVIA,
                    points: 80,
                    content: 'What statue sits atop the fountain?',
                    options: ['Hugo Wstinc', 'Saint Martin', 'Dom Canon', 'A Bishop'],
                    answer: 'Hugo Wstinc',
                }
            ]
        },
        {
            name: 'Oudegracht Wharf Cellars',
            description: 'Walk down to the water. These cellars were medieval warehouses.',
            order: 3,
            number: 3,
            lat: 52.0930,
            lng: 5.1180,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Water Level',
                    description: 'Touch the water (carefully!).',
                    type: ChallengeType.LOCATION,
                    points: 40,
                }
            ]
        },
        {
            name: 'Museum Speelklok',
            description: 'The most musical museum in the world, dedicated to self-playing instruments.',
            order: 4,
            number: 4,
            lat: 52.0915,
            lng: 5.1160,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Street Organ Power',
                    description: 'Listen for the music.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What is the "Perlee" famous for?',
                    options: ['Street Organs', 'Carillons', 'Music Boxes', 'Pianos'],
                    answer: 'Street Organs',
                }
            ]
        }
    ];

    await createStopsAndChallenges(utrechtTour.id, utrechtStops);


    // --- TOUR 3: Amsterdam Architectural Gems ---
    const amsterdamTour = await prisma.tour.create({
        data: {
            title: 'Amsterdam Architectural Gems',
            location: 'Amsterdam',
            description: 'Go beyond the Red Light District and explore the diverse architecture of Amsterdam, from the Golden Age to the Amsterdam School.',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Amsterdam_%285226759755%29.jpg/1024px-Amsterdam_%285226759755%29.jpg',
            distance: 6.0,
            duration: 150,
            points: 750,
            modes: ['WALKING', 'BIKING'],
            difficulty: Difficulty.EASY,
            authorId: alice.id,
            startLat: 52.3600,
            startLng: 4.8852,
        },
    });

    const amsStops = [
        {
            name: 'Het Schip',
            description: 'A masterpiece of the Amsterdam School of architecture. It looks like a ship!',
            order: 1,
            number: 1,
            lat: 52.3890,
            lng: 4.8690,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Brick Expressionism',
                    description: 'Admire the brickwork.',
                    type: ChallengeType.TRIVIA,
                    points: 100,
                    content: 'What was the original function of "Het Schip"?',
                    options: ['Social Housing', 'A Shipyard', 'A Palace', 'A Hotel'],
                    answer: 'Social Housing',
                }
            ]
        },
        {
            name: 'NDSM Wharf',
            description: 'A former shipyard turned into a cultural hotspot with graffiti art and cool cafes.',
            order: 2,
            number: 2,
            lat: 52.3990,
            lng: 4.8930,
            type: StopType.Nightlife,
            challenges: [
                {
                    title: 'Street Art Hunter',
                    description: 'Find the giant Anne Frank mural.',
                    type: ChallengeType.LOCATION,
                    points: 80,
                }
            ]
        },
        {
            name: 'EYE Film Museum',
            description: 'A futuristic building on the IJ river dedicated to film history.',
            order: 3,
            number: 3,
            lat: 52.3845,
            lng: 4.9000,
            type: StopType.Museum_Art,
            challenges: [
                {
                    title: 'Modern Lines',
                    description: 'Stand under the cantilever.',
                    type: ChallengeType.LOCATION,
                    points: 50,
                },
                {
                    title: 'Architect ID',
                    description: 'Who designed this?',
                    type: ChallengeType.TRIVIA,
                    points: 120,
                    content: 'Which Austrian firm designed the EYE?',
                    options: ['Delugan Meissl', 'Rem Koolhaas', 'Zaha Hadid', 'MVRDV'],
                    answer: 'Delugan Meissl',
                }
            ]
        }
    ];

    await createStopsAndChallenges(amsterdamTour.id, amsStops);


    // --- TOUR 4: Rotterdam Skyline Run ---
    const rotterdamTour = await prisma.tour.create({
        data: {
            title: 'Rotterdam Skyline Run',
            location: 'Rotterdam',
            description: 'A high-energy route crossing the iconic bridges of Rotterdam. Perfect for runners who want a view.',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Erasmusbrug_Rotterdam_September_2014.jpg/1024px-Erasmusbrug_Rotterdam_September_2014.jpg',
            distance: 8.5,
            duration: 50, // Running pace
            points: 900,
            modes: ['RUNNING'],
            difficulty: Difficulty.HARD,
            authorId: joey.id,
            startLat: 51.9089,
            startLng: 4.4876,
        },
    });

    const rdamStops = [
        {
            name: 'Erasmus Bridge',
            description: 'Start your run at "The Swan".',
            order: 1,
            number: 1,
            lat: 51.9089,
            lng: 4.4876,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Bridge Sprint',
                    description: 'Run to the middle pylon.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        },
        {
            name: 'Hotel New York',
            description: 'The historic HQ of the Holland America Line.',
            order: 2,
            number: 2,
            lat: 51.9030,
            lng: 4.4830,
            type: StopType.Food_Dining,
            challenges: [
                {
                    title: 'Immigrant Steps',
                    description: 'Find the suitcase sculpture.',
                    type: ChallengeType.TRIVIA,
                    points: 75,
                    content: 'Where did the ships from here primarily sail to?',
                    options: ['New York', 'Jakarta', 'Cape Town', 'Sydney'],
                    answer: 'New York',
                }
            ]
        },
        {
            name: 'Cube Houses',
            description: 'End your run at this mind-bending forest of houses.',
            order: 3,
            number: 3,
            lat: 51.9207,
            lng: 4.4906,
            type: StopType.Monument_Landmark,
            challenges: [
                {
                    title: 'Tilt Your Head',
                    description: 'Stand under a cube.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        }
    ];

    await createStopsAndChallenges(rotterdamTour.id, rdamStops);


    // --- TOUR 5: Kennemer Dunes Nature Walk ---
    const natureTour = await prisma.tour.create({
        data: {
            title: 'Kennemer Dunes Wildlife',
            location: 'Zandvoort',
            description: 'Escape the city and spot Highland cattle, Konik horses, and maybe a wisent in this rugged coastal park.',
            imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', // Reliable Nature/Forest Image
            distance: 7.0,
            duration: 180,
            points: 850,
            modes: ['WALKING', 'NATURE'],
            difficulty: Difficulty.MEDIUM,
            authorId: bob.id,
            startLat: 52.4170,
            startLng: 4.5680,
        },
    });

    const natureStops = [
        {
            name: 'Visitor Center De Kennemerduinen',
            description: 'Start your journey here and pick up a map.',
            order: 1,
            number: 1,
            lat: 52.4170,
            lng: 4.5680,
            type: StopType.Info_Point,
            challenges: [
                {
                    title: 'Eco-check',
                    description: 'Find the bird watching board.',
                    type: ChallengeType.TRIVIA,
                    points: 50,
                    content: 'Which huge bovine animal was reintroduced here?',
                    options: ['Wisent', 'Moose', 'Buffalo', 'Yak'],
                    answer: 'Wisent',
                }
            ]
        },
        {
            name: '\'t Wed',
            description: 'A beautiful dune lake where you can swim in summer.',
            order: 2,
            number: 2,
            lat: 52.4190,
            lng: 4.5580,
            type: StopType.Nature_Park,
            challenges: [
                {
                    title: 'Lake Reflection',
                    description: 'Reach the waters edge.',
                    type: ChallengeType.LOCATION,
                    points: 60,
                }
            ]
        },
        {
            name: 'Vogelmeer Viewpoint',
            description: 'The best spot to see rare birds and wild horses drinking.',
            order: 3,
            number: 3,
            lat: 52.4250,
            lng: 4.5450,
            type: StopType.Viewpoint,
            challenges: [
                {
                    title: 'Quiet Observer',
                    description: 'Spend 1 minute in silence.',
                    type: ChallengeType.LOCATION,
                    points: 100,
                }
            ]
        }
    ];

    await createStopsAndChallenges(natureTour.id, natureStops);


    // --- TOUR 6: Breda PubGolf Championship ---
    const bredaTour = await prisma.tour.create({
        data: {
            title: 'Breda PubGolf Championship',
            location: 'Breda',
            description: 'The ultimate pub golf experience in the pearl of the south. 12 holes, 12 drinks, one champion.',
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Breda_Grote_Markt.JPG/1024px-Breda_Grote_Markt.JPG', // Reliable Breda Grote Markt
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


    // --- Mock Active Tour for Dev ---
    // Start the Tata Steel tour for Joey
    const activeTour = await prisma.activeTour.create({
        data: {
            id: 112233445,
            tourId: tataTour.id,
            status: SessionStatus.IN_PROGRESS,
        },
    });

    await prisma.team.create({
        data: {
            activeTour: { connect: { id: activeTour.id } },
            user: { connect: { id: joey.id } },
            name: "Steel Explorers",
            color: '#FF6B6B',
            emoji: '🏗️',
            currentStop: 1,
            score: 0,
        }
    });

    console.log('Seed data created successfully with 5 high-quality tours.');
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
