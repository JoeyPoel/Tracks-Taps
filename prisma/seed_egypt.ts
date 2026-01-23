
import { ChallengeType, Difficulty, PrismaClient, StopType, TourStatus, TourType } from '@prisma/client';

// Helper interface to ensure we match the schema requirements
interface ChallengeSeed {
    title: string;
    type: ChallengeType;
    points: number;
    question: string; // Maps to 'content'
    options?: string[];
    answer?: string;
    bingoRow?: number;
    bingoCol?: number;
}

interface StopSeed {
    name: string;
    description: string;
    detailedDescription: string;
    number: number;
    lat: number;
    lng: number;
    type: StopType;
    imageUrl: string;
    challenges: ChallengeSeed[];
    pubgolfPar?: number;
    pubgolfDrink?: string;
}

interface TourSeed {
    title: string;
    location: string;
    description: string;
    imageUrl: string;
    distance: number;
    duration: number;
    points: number;
    modes: string[];
    difficulty: Difficulty;
    type: TourType;
    genre: string;
    startLat: number;
    startLng: number;
    stops: StopSeed[];
    globalChallenges: ChallengeSeed[];
}

export async function seedEgypt(prisma: PrismaClient, authorId: number) {
    console.log('Seeding 7 Immersive Egypt Tours...');

    const tours: TourSeed[] = [
        // 1. The Great Heights (Pyramids): Giza, Saqqara, Dahshur
        {
            title: 'The Great Heights: Engineering of Eternity',
            location: 'Giza & Dahshur',
            description: 'Beyond the tourist traps lies the true story of the pyramids. This tour focuses on the evolution of engineering, astronomy, and the sheer human will that built the Old Kingdom. You will visit Giza, Saqqara, and Dahshur.',
            imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
            distance: 45.0,
            duration: 480, // 8 hours
            points: 3500,
            modes: ['DRIVING', 'WALKING'],
            difficulty: Difficulty.MEDIUM,
            type: TourType.DAY_TRIP,
            genre: 'History',
            startLat: 29.9792,
            startLng: 31.1342,
            globalChallenges: [
                { title: 'Solar Alignment', type: ChallengeType.TRIVIA, points: 200, question: 'The pyramids are aligned to true north with an accuracy of?', options: ['3/60th of a degree', '1 degree', '5 degrees'], answer: '3/60th of a degree' },
                { title: 'Camel Selfies', type: ChallengeType.PICTURE, points: 150, question: 'Take a photo with 3 different camels in the background.' },
                { title: 'The Triad', type: ChallengeType.LOCATION, points: 100, question: 'Stand where you can see all three Giza pyramids clearly.' }
            ],
            stops: [
                {
                    name: 'The Great Sphinx',
                    description: 'The Guardian of the Plateau.',
                    detailedDescription: 'The Sphinx is the oldest known monumental sculpture in Egypt. Cut from the bedrock, the original shape of the head is believed to be Khafre. Notice the erosion patterns - some argue they are water weathering from a wetter climate era.',
                    number: 1,
                    lat: 29.9753,
                    lng: 31.1376,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1563203668-b71a2e34278c',
                    challenges: [
                        { title: 'The Nose Job', type: ChallengeType.TRIVIA, points: 100, question: 'Who is historically blamed for shooting off the nose (incorrectly)?', options: ['Napoleon', 'The British', 'The Ottomans'], answer: 'Napoleon' },
                        { title: 'Beneath the Paws', type: ChallengeType.TRIVIA, points: 200, question: 'Legend says a Hall of Records lies beneath specifically which paw?', options: ['Right Paw', 'Left Paw', 'Tail'], answer: 'Right Paw' }
                    ]
                },
                {
                    name: 'Khufu’s Pyramid (Great Pyramid)',
                    description: 'The last Wonder of the Ancient World.',
                    detailedDescription: 'Built with 2.3 million stone blocks. It was the tallest man-made structure for over 3,800 years. Look closely at the base to see the few remaining casing stones that once made it smooth and white.',
                    number: 2,
                    lat: 29.9792,
                    lng: 31.1342,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1662669046039-b9a352136979',
                    challenges: [
                        { title: 'Weight Watchers', type: ChallengeType.TRIVIA, points: 100, question: 'Average weight of a block?', options: ['2.5 Tons', '10 Tons', '500kg'], answer: '2.5 Tons' }
                    ]
                },
                {
                    name: 'Solar Boat Museum',
                    description: 'A ship for the afterlife.',
                    detailedDescription: 'This cedar wood ship was buried in pieces next to the pyramid. It was designed to carry the Pharaoh across the sky with the Sun God Ra. The preservation of the wood is miraculous.',
                    number: 3,
                    lat: 29.9780,
                    lng: 31.1350,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9',
                    challenges: [
                        { title: 'Wood Origin', type: ChallengeType.TRIVIA, points: 150, question: 'Where was the cedar wood imported from?', options: ['Lebanon', 'Nubia', 'Greece'], answer: 'Lebanon' }
                    ]
                },
                {
                    name: 'Panorama Point',
                    description: 'The perfect alignment view.',
                    detailedDescription: 'From this vantage point, you can see the Queens pyramids and the alignment of the three main giants (Khufu, Khafre, Menkaure). It is the perfect spot for understanding the astronomical layout.',
                    number: 4,
                    lat: 29.9725,
                    lng: 31.1270,
                    type: StopType.Viewpoint,
                    imageUrl: 'https://images.unsplash.com/photo-1599551403062-811c0f0fb01b',
                    challenges: [
                        { title: 'Perspective Trick', type: ChallengeType.PICTURE, points: 150, question: 'Take a forced perspective photo holding a pyramid by the tip.' }
                    ]
                },
                {
                    name: 'Serapeum of Saqqara',
                    description: 'The massive granite sarcophagi.',
                    detailedDescription: 'Underground galleries containing massive granite sarcophagi for the Apis bulls. The engineering precision here rivals modern technology—the internal corners are perfect 90-degree angles.',
                    number: 5,
                    lat: 29.8700,
                    lng: 31.2150,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1506509939527-2c99933182b8',
                    challenges: [
                        { title: 'Heavy Lifting', type: ChallengeType.TRIVIA, points: 200, question: 'How much does a single lid weigh?', options: ['30 Tons', '10 Tons', '5 Tons'], answer: '30 Tons' }
                    ]
                },
                {
                    name: 'Step Pyramid of Djoser',
                    description: 'The first pyramid ever built.',
                    detailedDescription: 'Designed by Imhotep, started as a mastaba and grew into a step pyramid. It is the architectural grandfather of Giza. Navigate the colonnade entrance carefully.',
                    number: 6,
                    lat: 29.8710,
                    lng: 31.2163,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1506509939527-2c99933182b8',
                    challenges: [
                        { title: 'Architect Name', type: ChallengeType.TRIVIA, points: 100, question: 'Who was the architect?', options: ['Imhotep', 'Khufu', 'Sneferu'], answer: 'Imhotep' }
                    ]
                },
                {
                    name: 'Bent Pyramid (Dahshur)',
                    description: 'The learning curve.',
                    detailedDescription: 'Sneferu’s engineers realized halfway up that the 54-degree angle was unstable, so they bent it to 43 degrees. It retains most of its original outer casing, giving a glimpse of what all pyramids looked like.',
                    number: 7,
                    lat: 29.7902,
                    lng: 31.2093,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1707920364027-2ff175dabe42',
                    challenges: [
                        { title: 'Angle Check', type: ChallengeType.TRIVIA, points: 150, question: 'What is the upper angle?', options: ['43 degrees', '54 degrees', '60 degrees'], answer: '43 degrees' }
                    ]
                },
                {
                    name: 'Red Pyramid (Dahshur)',
                    description: 'The first true pyramid.',
                    detailedDescription: 'Correcting the mistakes of the Bent Pyramid, this structure is geometrically perfect. It is reddish due to the iron-rich limestone core revealed after the white casing was stripped.',
                    number: 8,
                    lat: 29.8085,
                    lng: 31.2060,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1534234828563-023c10b7b137',
                    challenges: [
                        { title: 'Smell of Ammonia', type: ChallengeType.TRIVIA, points: 100, question: 'Inside the chamber, the air smells strongly of what?', options: ['Ammonia/Bats', 'Incense', 'Sulfur'], answer: 'Ammonia/Bats' }
                    ]
                }
            ]
        },

        // 2. The Surreal Odyssey (Desert): Bahariya, White Desert, Black Desert
        {
            title: 'The Surreal Odyssey: Alien Landscapes',
            location: 'White Desert & Bahariya',
            description: 'A multi-day expedition into the alien landscapes of the Western Desert. From the volcanic Black Desert to the chalk sculptures of the White Desert, this is Egypt like you have never seen it.',
            imageUrl: 'https://images.unsplash.com/photo-1552554602-cb380a06d860',
            distance: 350.0,
            duration: 1440, // 2 days
            points: 5000,
            modes: ['DRIVING', 'HIKING'],
            difficulty: Difficulty.HARD,
            type: TourType.EXPEDITION,
            genre: 'Nature',
            startLat: 28.3555,
            startLng: 28.8950,
            globalChallenges: [
                { title: 'Star Gazer', type: ChallengeType.LOCATION, points: 300, question: 'Locate the Milky Way at night.' },
                { title: 'Silence', type: ChallengeType.DARE, points: 500, question: 'Sit in absolute silence for 10 minutes in the White Desert.' }
            ],
            stops: [
                {
                    name: 'Bahariya Oasis',
                    description: 'The gateway to the desert.',
                    detailedDescription: 'A lush island of green in a sea of yellow. Renowned for its dates and hot springs. Visit the museum of the Golden Mummies.',
                    number: 1,
                    lat: 28.3555,
                    lng: 28.8950,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1542456627-25e2e92c2a05',
                    challenges: [
                        { title: 'Date Tasting', type: ChallengeType.TRIVIA, points: 100, question: 'Bahariya produces 25% of Egypt\'s what?', options: ['Dates', 'Olives', 'Cotton'], answer: 'Dates' }
                    ]
                },
                {
                    name: 'The Black Desert',
                    description: 'A volcanic wasteland.',
                    detailedDescription: 'Dozens of small, black-topped volcanic mounds scattered across orange sands. It looks like a scene from Mars. The stones are dolerite.',
                    number: 2,
                    lat: 28.0000,
                    lng: 28.5000,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1533053127272-b7e556e43521',
                    challenges: [
                        { title: 'Volcanic Rock', type: ChallengeType.PICTURE, points: 100, question: 'Find a perfectly shiny black stone.' }
                    ]
                },
                {
                    name: 'Crystal Mountain',
                    description: 'A ridge of pure crystal.',
                    detailedDescription: 'Not a mountain, but a ridge made entirely of calcite crystal. The sun makes it sparkle intensely. Be careful, the shards are sharp.',
                    number: 3,
                    lat: 27.6667,
                    lng: 28.0000,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1518182170546-07fb61270ae4',
                    challenges: [
                        { title: 'Crystal ID', type: ChallengeType.TRIVIA, points: 150, question: 'What mineral is this?', options: ['Calcite', 'Quartz', 'Diamond'], answer: 'Calcite' }
                    ]
                },
                {
                    name: 'Agabat Valley',
                    description: 'The beautiful valley.',
                    detailedDescription: 'Massive white monoliths rise from the sand. "Agabat" means "difficult" in Arabic, referring to the tough passage for old caravans.',
                    number: 4,
                    lat: 27.5000,
                    lng: 28.1000,
                    type: StopType.Viewpoint,
                    imageUrl: 'https://images.unsplash.com/photo-1516214104703-d870798883c5',
                    challenges: [
                        { title: 'Sandboarding', type: ChallengeType.DARE, points: 200, question: 'Slide down a dune (on a board or your feet).' }
                    ]
                },
                {
                    name: 'The White Desert (Main Area)',
                    description: 'Mushroom rocks and chicken stones.',
                    detailedDescription: 'Wind-carved chalk formations that look like mushrooms, chickens, and rabbits. At night, under the moon, they glow ghostly white.',
                    number: 5,
                    lat: 27.3800,
                    lng: 28.1500,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1545648839-44de9435b64c',
                    challenges: [
                        { title: 'The Chicken', type: ChallengeType.LOCATION, points: 150, question: 'Find the famous "Chicken and Mushroom" rock formation.' }
                    ]
                },
                {
                    name: 'Old White Desert',
                    description: 'The ancient seabed.',
                    detailedDescription: 'Flatter than the main area, rich in marine fossils. You are walking on an ocean floor from the Cretaceous period.',
                    number: 6,
                    lat: 27.4000,
                    lng: 28.2000,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57',
                    challenges: [
                        { title: 'Fossil Hunt', type: ChallengeType.PICTURE, points: 200, question: 'Photograph a seashell fossil embedded in the rock.' }
                    ]
                },
                {
                    name: 'Bir Sigam Hot Spring',
                    description: 'Thermal relaxation.',
                    detailedDescription: 'A natural hot spring reaching 45 degrees Celsius. The perfect end to a dusty day. The water is rich in sulfur and minerals.',
                    number: 7,
                    lat: 28.3000,
                    lng: 28.8500,
                    type: StopType.Facilities,
                    imageUrl: 'https://images.unsplash.com/photo-1579600164992-a701b31eb37a',
                    challenges: [
                        { title: 'Temperature Test', type: ChallengeType.DARE, points: 100, question: 'Submerge fully for at least 1 minute.' }
                    ]
                },
                {
                    name: 'English House (Bahariya)',
                    description: 'WWI lookout.',
                    detailedDescription: 'Ruins of a lookout post used by Captain Williams distincting WWI to monitor Senussi movements. Offers a panoramic view of the oasis.',
                    number: 8,
                    lat: 28.3600,
                    lng: 28.9000,
                    type: StopType.Viewpoint,
                    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
                    challenges: [
                        { title: 'History Buff', type: ChallengeType.TRIVIA, points: 100, question: 'Which war was this built for?', options: ['WWI', 'WWII', 'Napoleon'], answer: 'WWI' }
                    ]
                }
            ]
        },

        // 3. The Soul of the City (Culture): Coptic & Islamic Cairo
        {
            title: 'The Soul of the City: Minarets & Monasteries',
            location: 'Old Cairo',
            description: 'Dive deep into the spiritual heart of Cairo. Walk the timeline from the Holy Family\'s refuge to the golden age of Islamic architecture on Al-Muizz Street.',
            imageUrl: 'https://images.unsplash.com/photo-1560126437-024258f1f77d',
            distance: 8.0,
            duration: 300,
            points: 2500,
            modes: ['WALKING'],
            difficulty: Difficulty.EASY,
            type: TourType.DAY_TRIP,
            genre: 'Culture',
            startLat: 30.0055,
            startLng: 31.2300,
            globalChallenges: [
                { title: 'Call to Prayer', type: ChallengeType.DARE, points: 100, question: 'Record the sound of the Azan from a minaret.' },
                { title: 'Incense', type: ChallengeType.TRIVIA, points: 50, question: 'What scent is burning in the Coptic churches?', options: ['Frankincense', 'Myrrh', 'Rose'], answer: 'Frankincense' }
            ],
            stops: [
                {
                    name: 'The Hanging Church',
                    description: 'Suspended history.',
                    detailedDescription: 'Built on top of the gatehouse of the Roman Babylon Fortress. The nave is suspended over a passage. Look through the glass floor panel to see the fortress below.',
                    number: 1,
                    lat: 30.0055,
                    lng: 31.2300,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1548682977-f273574c3e83',
                    challenges: [
                        { title: 'Icon Count', type: ChallengeType.TRIVIA, points: 100, question: 'How many icons are on the iconostasis?', options: ['110', '50', '20'], answer: '110' }
                    ]
                },
                {
                    name: 'Abu Serga Church',
                    description: 'The Holy Family\'s Crypt.',
                    detailedDescription: 'Believed to be built where Joseph, Mary, and Jesus rested during their flight into Egypt. The crypt contains the original well they used.',
                    number: 2,
                    lat: 30.0060,
                    lng: 31.2310,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1594145788776-88d447f573b2',
                    challenges: [
                        { title: 'Well Depth', type: ChallengeType.LOCATION, points: 150, question: 'Look down into the ancient well inside the crypt.' }
                    ]
                },
                {
                    name: 'Ben Ezra Synagogue',
                    description: 'The Geniza discovery.',
                    detailedDescription: 'Once a church, then a synagogue. Famous for the "Geniza" documents found here in the 19th century that revolutionized our understanding of medieval history.',
                    number: 3,
                    lat: 30.0065,
                    lng: 31.2315,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1591807755359-5f284e365023',
                    challenges: [
                        { title: 'Baby Moses', type: ChallengeType.TRIVIA, points: 120, question: 'Legend says who was found in the reeds nearby?', options: ['Moses', 'Joseph', 'Aaron'], answer: 'Moses' }
                    ]
                },
                {
                    name: 'Bab Zuweila',
                    description: 'The Gate of Execution.',
                    detailedDescription: 'One of the three remaining gates of the Fatimid city. The skulls of executed criminals used to be displayed here. Climb the minarets for the best view of Islamic Cairo.',
                    number: 4,
                    lat: 30.0425,
                    lng: 31.2590,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1583256038318-7b8979116e03',
                    challenges: [
                        { title: 'Executioner', type: ChallengeType.TRIVIA, points: 100, question: 'Which Sultan was hanged here?', options: ['Tuman bay II', 'Saladin', 'Qutuz'], answer: 'Tuman bay II' }
                    ]
                },
                {
                    name: 'Tentmakers Market (Khayamiya)',
                    description: 'The last covered market.',
                    detailedDescription: 'Across from Bab Zuweila, this is the only remaining medieval covered market in Cairo. Artisans hand-stitch complex geometric applique designs.',
                    number: 5,
                    lat: 30.0420,
                    lng: 31.2590,
                    type: StopType.Shopping,
                    imageUrl: 'https://images.unsplash.com/photo-1597825596350-13756d10523f',
                    challenges: [
                        { title: 'Stitch Count', type: ChallengeType.PICTURE, points: 150, question: 'Take a close-up video of a needle worker in action.' }
                    ]
                },
                {
                    name: 'Al-Muizz Street',
                    description: 'Open air museum.',
                    detailedDescription: 'The greatest concentration of medieval architectural treasures in the Islamic world. Mosques, madrasas, and hammams line this pedestrian street.',
                    number: 6,
                    lat: 30.0500,
                    lng: 31.2600,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b',
                    challenges: [
                        { title: 'Night Light', type: ChallengeType.LOCATION, points: 100, question: 'Find the Qalawun Complex illuminated at night.' }
                    ]
                },
                {
                    name: 'Khan el-Khalili',
                    description: 'The great bazaar.',
                    detailedDescription: 'A labyrinth of spices, gold, and souvenirs. Establish eye contact, haggle hard, and get lost in the scent of saffron and oud.',
                    number: 7,
                    lat: 30.0478,
                    lng: 31.2622,
                    type: StopType.Shopping,
                    imageUrl: 'https://images.unsplash.com/photo-1590425621379-3733027b40d5',
                    challenges: [
                        { title: 'The Haggle', type: ChallengeType.DARE, points: 300, question: 'Negotiate the price of a souvenir down by at least 40%.' }
                    ]
                },
                {
                    name: 'El Fishawy Cafe',
                    description: 'The Mirror Cafe.',
                    detailedDescription: 'Open 24/7 for over 200 years. Famous for its large mirrors and intellectuals. Naguib Mahfouz wrote parts of his Nobel trilogy here.',
                    number: 8,
                    lat: 30.0480,
                    lng: 31.2625,
                    type: StopType.Coffee_Drink,
                    imageUrl: 'https://images.unsplash.com/photo-1512413155160-b6a152d1264c',
                    challenges: [
                        { title: 'Mint Tea', type: ChallengeType.PICTURE, points: 50, question: 'Photo of your mint tea with a mirror in the background.' }
                    ]
                },
                {
                    name: 'Sultan Hassan Mosque',
                    description: 'The Pyramid of Mosques.',
                    detailedDescription: 'Massive, imposing, and structurally incredibly complex. It houses four madrasas (schools) for the four Sunni rites. Stand in the central courtyard to feel small.',
                    number: 9,
                    lat: 30.0325,
                    lng: 31.2560,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1560936647-380d1964f434',
                    challenges: [
                        { title: 'Echo Chamber', type: ChallengeType.DARE, points: 100, question: 'Clap in the entrance vestibule to hear the echo.' }
                    ]
                }
            ]
        },

        // 4. The Pharaoh’s Feast (Food & Drink)
        {
            title: 'The Pharaoh\'s Feast: Culinary Cairo',
            location: 'Downtown & Nile',
            description: 'A gastronomic tour from the chaotic carb-fest of street food to the serenity of a Nile-side dinner. Come hungry, leave in a food coma.',
            imageUrl: 'https://images.unsplash.com/photo-1560717845-968823efbee1',
            distance: 5.0,
            duration: 240,
            points: 1500,
            modes: ['WALKING', 'TRANSIT'],
            difficulty: Difficulty.EASY,
            type: TourType.QUICK_TRIP,
            genre: 'Food',
            startLat: 30.0444,
            startLng: 31.2357,
            globalChallenges: [
                { title: 'Spicy Test', type: ChallengeType.DARE, points: 200, question: 'Eat a whole pickled chili pepper.' },
                { title: 'Arabic Coffee', type: ChallengeType.TRIVIA, points: 50, question: 'What is "Sada" coffee?', options: ['No Sugar', 'Extra Sugar', 'Milk'], answer: 'No Sugar' }
            ],
            stops: [
                {
                    name: 'Abou Tarek Koshary',
                    description: 'The Carb King.',
                    detailedDescription: 'Multi-story neon-lit temple to Koshary (rice, pasta, lentils, chickpeas, tomato sauce, fried onions). It is loud, fast, and quintessential Cairo.',
                    number: 1,
                    lat: 30.0485,
                    lng: 31.2370,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1596450523249-1be1c9d2f2df',
                    challenges: [
                        { title: 'Dakkah Pour', type: ChallengeType.DARE, points: 100, question: 'Add the garlic vinegar (Dakkah) and chili sauce liberally.' }
                    ]
                },
                {
                    name: 'Felfela',
                    description: 'Traditional excellence.',
                    detailedDescription: 'A rustic, charming interior serving classic Egyptian mezzes. The Ta\'ameya (Egyptian Falafel made with fava beans) is legendary.',
                    number: 2,
                    lat: 30.0440,
                    lng: 31.2380,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea',
                    challenges: [
                        { title: 'Bean ID', type: ChallengeType.TRIVIA, points: 50, question: 'What bean is Ta\'ameya made from?', options: ['Fava', 'Chickpea', 'Black Bean'], answer: 'Fava' }
                    ]
                },
                {
                    name: 'Café Riche',
                    description: 'Revolutionary coffee.',
                    detailedDescription: 'Where the 1919 revolution was planned. A dusty, atmospheric time capsule of literary and political Cairo.',
                    number: 3,
                    lat: 30.0460,
                    lng: 31.2360,
                    type: StopType.Coffee_Drink,
                    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
                    challenges: [
                        { title: 'Portrait Hunt', type: ChallengeType.LOCATION, points: 100, question: 'Find the photo of Om Kalthoum on the wall.' }
                    ]
                },
                {
                    name: 'Groppi',
                    description: 'Faded European glory.',
                    detailedDescription: 'Once the chocolatier to the King. The mosaic entrance and art deco style tell tales of a cosmopolitan past.',
                    number: 4,
                    lat: 30.0450,
                    lng: 31.2340,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1509456592530-5d38e33f35d4',
                    challenges: [
                        { title: 'Ice Cream', type: ChallengeType.TRIVIA, points: 50, question: 'What was Groppi famous for introducing to Egypt?', options: ['Ice Cream', 'Pizza', 'Sushi'], answer: 'Ice Cream' }
                    ]
                },
                {
                    name: 'Kebdet El Prince',
                    description: 'The Liver King (Imbaba).',
                    detailedDescription: 'Located in working-class Imbaba. No reservations, chaotic lines, and the best beef liver (Kebda) in the city. A true local experience.',
                    number: 5,
                    lat: 30.0700,
                    lng: 31.2100,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1577308856961-8e9ec50d0c6b',
                    challenges: [
                        { title: 'Molokhia Dip', type: ChallengeType.DARE, points: 150, question: 'Dip your bread in the green slime (Molokhia) and eat it.' }
                    ]
                },
                {
                    name: 'El Abd Patisserie',
                    description: 'Sweet overload.',
                    detailedDescription: 'Lines spill onto the street for their Basbousa and Konafa. The smell of sugar syrup and ghee is intoxicating.',
                    number: 6,
                    lat: 30.0470,
                    lng: 31.2380,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c',
                    challenges: [
                        { title: 'Nut Check', type: ChallengeType.TRIVIA, points: 50, question: 'What nut is usually on top of a single Basbousa square?', options: ['Almond/Hazelnut', 'Peanut', 'Walnut'], answer: 'Almond/Hazelnut' }
                    ]
                },
                {
                    name: 'Naguib Mahfouz Cafe',
                    description: 'Khan el Khalili luxury.',
                    detailedDescription: 'An oasis of AC and tile work deeply inside the market. Great for a mint lemonade rescue.',
                    number: 7,
                    lat: 30.0480,
                    lng: 31.2620,
                    type: StopType.Coffee_Drink,
                    imageUrl: 'https://images.unsplash.com/photo-1512413155160-b6a152d1264c',
                    challenges: [
                        { title: 'Lemon Mint', type: ChallengeType.PICTURE, points: 100, question: 'Photo of the three-layered juice.' }
                    ]
                },
                {
                    name: 'Sequoia (or Left Bank equivalent)',
                    description: 'Nile Breeze.',
                    detailedDescription: 'End the night on the tip of Zamalek island. Open air, right on the water, shisha smoke, and city lights reflecting on the Nile.',
                    number: 8,
                    lat: 30.0700,
                    lng: 31.2220,
                    type: StopType.Food_Dining,
                    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
                    challenges: [
                        { title: 'River Traffic', type: ChallengeType.LOCATION, points: 50, question: 'Spot a Felucca passing by.' }
                    ]
                },
                {
                    name: 'Ahwa Baladi (Random Street Cafe)',
                    description: 'The final shisha.',
                    detailedDescription: 'Any street corner cafe with plastic chairs. Order a "Shisha Toffaha" (Apple) and watch the world go by.',
                    number: 9,
                    lat: 30.0400,
                    lng: 31.2300,
                    type: StopType.Coffee_Drink,
                    imageUrl: 'https://images.unsplash.com/photo-1520286377823-3b1dfd495746',
                    challenges: [
                        { title: 'Domino Slam', type: ChallengeType.DARE, points: 100, question: 'Slam a domino tile on the table like a local.' }
                    ]
                }
            ]
        },

        // 5. The Golden Hole-in-One (Pub Golf): Zamalek
        {
            title: 'The Golden Hole-in-One: Zamalek Links',
            location: 'Zamalek',
            description: 'A 9-hole course through the diplomatic enclave of Zamalek. Upscale bars, dive pubs, and rooftop lounges. Dress code: Golf attire or Smart Casual. Strict par count.',
            imageUrl: 'https://images.unsplash.com/photo-1574169208507-84376144848b',
            distance: 4.5,
            duration: 300,
            points: 2000,
            modes: ['WALKING', 'PUBGOLF'],
            difficulty: Difficulty.HARD,
            type: TourType.QUICK_TRIP,
            genre: 'Nightlife',
            startLat: 30.0558,
            startLng: 31.2217,
            globalChallenges: [
                { title: 'Water Hazard', type: ChallengeType.DARE, points: 100, question: 'Drink a full glass of water at Hole 5.' },
                { title: 'Birdie', type: ChallengeType.DARE, points: 200, question: 'Complete a hole in one sip less than par.' }
            ],
            stops: [
                { name: 'Pub 28', description: 'Hole 1: The Warm Up.', detailedDescription: 'Dark wood, British vibe. Start efficient.', number: 1, lat: 30.0592, lng: 31.2235, type: StopType.Nightlife, pubgolfPar: 3, pubgolfDrink: 'Sakara Gold (Bottle)', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b', challenges: [] },
                { name: 'L\'Aubergine', description: 'Hole 2: The Vegetarian.', detailedDescription: 'A classic bar upstairs. Watch the stairs.', number: 2, lat: 30.0620, lng: 31.2210, type: StopType.Nightlife, pubgolfPar: 4, pubgolfDrink: 'Gin & Tonic', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87', challenges: [] },
                { name: 'Rooftop Zamalek', description: 'Hole 3: The View.', detailedDescription: 'Nile view. Don\'t get distracted.', number: 3, lat: 30.0550, lng: 31.2250, type: StopType.Nightlife, pubgolfPar: 3, pubgolfDrink: 'Stella', imageUrl: 'https://images.unsplash.com/photo-1519671482538-518b48d19eb8', challenges: [] },
                { name: 'Five Bells', description: 'Hole 4: The Garden.', detailedDescription: 'Outdoor seating. Relaxing.', number: 4, lat: 30.0580, lng: 31.2220, type: StopType.Nightlife, pubgolfPar: 5, pubgolfDrink: 'Bull Shot', imageUrl: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e', challenges: [] },
                { name: 'Crimson', description: 'Hole 5: The High Roller.', detailedDescription: 'Expensive and classy. Sip slowly.', number: 5, lat: 30.0565, lng: 31.2260, type: StopType.Nightlife, pubgolfPar: 4, pubgolfDrink: 'Wine Glass', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', challenges: [] },
                { name: 'Deals', description: 'Hole 6: The Dive.', detailedDescription: 'Cheap and cheerful. Loud music.', number: 6, lat: 30.0600, lng: 31.2200, type: StopType.Nightlife, pubgolfPar: 3, pubgolfDrink: 'Shot of choice', imageUrl: 'https://images.unsplash.com/photo-1569937756447-e19c3623d386', challenges: [] },
                { name: 'U Bistrot', description: 'Hole 7: The Chic.', detailedDescription: 'Modern atmosphere. Craft cocktails.', number: 7, lat: 30.0570, lng: 31.2240, type: StopType.Nightlife, pubgolfPar: 4, pubgolfDrink: 'Mojito', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd', challenges: [] },
                { name: 'Harry\'s Pub', description: 'Hole 8: Marriott.', detailedDescription: 'Inside a palace. Feel royal.', number: 8, lat: 30.0555, lng: 31.2270, type: StopType.Nightlife, pubgolfPar: 3, pubgolfDrink: 'Heineken', imageUrl: 'https://images.unsplash.com/photo-1572116469696-9a25771d9c15', challenges: [] },
                { name: 'Cairo Jazz Club', description: 'Hole 9: The Final Boss.', detailedDescription: 'The night ends here. Dance it off.', number: 9, lat: 30.0630, lng: 31.2180, type: StopType.Nightlife, pubgolfPar: 4, pubgolfDrink: 'Tequila Shot', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', challenges: [] }
            ]
        },

        // 6. The Untrodden Path (Hidden Gems): Manshiyat Naser & City of Dead
        {
            title: 'The Untrodden Path: City of the Dead',
            location: 'East Cairo',
            description: 'Not for the faint of heart. Visit the Cave Church in Garbage City, wander the City of the Dead where the living cohabit with beautiful tombs, and measure the Nile\'s flood.',
            imageUrl: 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08',
            distance: 10.0,
            duration: 360,
            points: 2800,
            modes: ['WALKING', 'TRANSIT'],
            difficulty: Difficulty.HARD,
            type: TourType.EXPEDITION,
            genre: 'Adventure',
            startLat: 30.0300,
            startLng: 31.2700,
            globalChallenges: [
                { title: 'Respect', type: ChallengeType.DARE, points: 100, question: 'Keep your camera hidden in sensitive residential areas.' },
                { title: 'Recycling', type: ChallengeType.TRIVIA, points: 50, question: 'What percentage of trash is recycled in Garbage City?', options: ['10%', '50%', '85%+'], answer: '85%+' }
            ],
            stops: [
                {
                    name: 'Monastery of Saint Simon (Cave Church)',
                    description: 'Carved into the Mokattam mountain.',
                    detailedDescription: 'The largest church in the Middle East, seating 20,000. It is located deep inside Garbage City (Manshiyat Naser). The journey there is an eye-opener.',
                    number: 1,
                    lat: 30.0300,
                    lng: 31.2750,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
                    challenges: [
                        { title: 'Carving Art', type: ChallengeType.PICTURE, points: 100, question: 'Find a biblical carving in the rock face.' }
                    ]
                },
                {
                    name: 'City of the Dead (Northern Cemetery)',
                    description: 'Life among the tombs.',
                    detailedDescription: 'A vast necropolis where Mamluk sultans are buried, and where thousands of Cairenes live today in the tomb courtyards. It is not scary, but distinctively peaceful.',
                    number: 2,
                    lat: 30.0400,
                    lng: 31.2700,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1445217488035-6477d5448375',
                    challenges: [
                        { title: 'Sultan Qaitbry', type: ChallengeType.LOCATION, points: 150, question: 'Locate the Mosque of Qaitbay, printed on the 1 pound note.' }
                    ]
                },
                {
                    name: 'Nilometer (Rhoda Island)',
                    description: 'Measuring the flood.',
                    detailedDescription: 'Used since 861 AD to measure the rise of the Nile. The tax level was determined by this. A beautiful, deep structure with intricate carvings.',
                    number: 3,
                    lat: 30.0069,
                    lng: 31.2250,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1596564632832-8411b012eb76',
                    challenges: [
                        { title: 'Bottom Step', type: ChallengeType.DARE, points: 150, question: 'Walk all the way to the bottom level (if water permits).' }
                    ]
                },
                {
                    name: 'Manial Palace',
                    description: 'Eclectic royal residence.',
                    detailedDescription: 'Prince Mohamed Ali\'s palace. A mix of Ottoman, Moorish, Persian, and Rococo styles. The gardens are filled with rare tropical plants.',
                    number: 4,
                    lat: 30.0270,
                    lng: 31.2290,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1588713029272-4638d01726a8',
                    challenges: [
                        { title: 'Golden Room', type: ChallengeType.PICTURE, points: 100, question: 'Photograph the heavy golden ceiling.' }
                    ]
                },
                {
                    name: 'Gayer-Anderson Museum',
                    description: 'The Bond House.',
                    detailedDescription: 'Two joined 17th-century houses filled with an eccentric British major\'s collection. Featured in "The Spy Who Loved Me".',
                    number: 5,
                    lat: 30.0300,
                    lng: 31.2500,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1460398495412-6804baef3fa4',
                    challenges: [
                        { title: 'Mashrabiya', type: ChallengeType.LOCATION, points: 80, question: 'Look through a hidden harem window.' }
                    ]
                },
                {
                    name: 'Ibn Tulun Mosque',
                    description: 'Geometric perfection.',
                    detailedDescription: 'The oldest mosque in the city surviving in its original form. Its spiral minaret is unique in Egypt, inspired by Samarra in Iraq.',
                    number: 6,
                    lat: 30.0287,
                    lng: 31.2530,
                    type: StopType.Religious,
                    imageUrl: 'https://images.unsplash.com/photo-1549495563-71a5c0b11fb9',
                    challenges: [
                        { title: 'Spiral Climb', type: ChallengeType.DARE, points: 150, question: 'Climb the spiral external staircase of the minaret.' }
                    ]
                },
                {
                    name: 'Souq al-Gomaa (Friday Market)',
                    description: 'Everything and nothing.',
                    detailedDescription: 'Under the Autostrad bridge. Antique furniture, animals, car parts, old clothes. A chaotic, vibrant flea market (best on Fridays).',
                    number: 7,
                    lat: 30.0200,
                    lng: 31.2600,
                    type: StopType.Shopping,
                    imageUrl: 'https://images.unsplash.com/photo-1528699264551-766786c35905',
                    challenges: [
                        { title: 'Antique Hunt', type: ChallengeType.PICTURE, points: 100, question: 'Take a photo of something older than 50 years.' }
                    ]
                },
                {
                    name: 'Al-Azhar Park',
                    description: 'Green lung.',
                    detailedDescription: 'Built on a 500-year-old rubbish dump. It offers the best sunset views over the Citadel and Islamic Cairo.',
                    number: 8,
                    lat: 30.0400,
                    lng: 31.2650,
                    type: StopType.Nature_Park,
                    imageUrl: 'https://images.unsplash.com/photo-1518544801389-c4c0423c5e84',
                    challenges: [
                        { title: 'Citadel View', type: ChallengeType.PICTURE, points: 100, question: 'Pro photo of the Citadel framed by park trees.' }
                    ]
                }
            ]
        },

        // 7. The Urban Legend (Modern/Eclectic): Downtown & Zamalek
        {
            title: 'The Urban Legend: Modern Cairo',
            location: 'Downtown',
            description: 'Street art, abandoned grandeur, and the contemporary pulse of the city. Explore the "Paris on the Nile" architecture and the hidden art galleries.',
            imageUrl: 'https://images.unsplash.com/photo-1552596488-827d09559c39',
            distance: 6.0,
            duration: 240,
            points: 1800,
            modes: ['WALKING'],
            difficulty: Difficulty.EASY,
            type: TourType.QUICK_TRIP,
            genre: 'Art',
            startLat: 30.0440,
            startLng: 31.2400,
            globalChallenges: [
                { title: 'Talaat Harb', type: ChallengeType.LOCATION, points: 50, question: 'Find the statue of Talaat Harb.' },
                { title: 'Graffiti', type: ChallengeType.PICTURE, points: 100, question: 'Find a piece of revolutionary street art (what remains).' }
            ],
            stops: [
                {
                    name: 'Tahrir Square',
                    description: 'The Heart of the Revolution.',
                    detailedDescription: 'The center of modern Egyptian political history. Once dominated by the Mugamma, now renovated with a obelisk and rams.',
                    number: 1,
                    lat: 30.0444,
                    lng: 31.2357,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1519781848529-5735c0296700',
                    challenges: [
                        { title: 'Obelisk', type: ChallengeType.TRIVIA, points: 50, question: 'Which Pharaoh is named on the central obelisk?', options: ['Ramses II', 'Tutankhamun', 'Akhenaten'], answer: 'Ramses II' }
                    ]
                },
                {
                    name: 'Townhouse Gallery',
                    description: 'Contemporary Art.',
                    detailedDescription: 'Tucked in a mechanic\'s alleyway, this gallery pioneered the downtown art scene.',
                    number: 2,
                    lat: 30.0480,
                    lng: 31.2400,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1515405295579-ba7b454989fa',
                    challenges: [
                        { title: 'Art Critique', type: ChallengeType.TRIVIA, points: 50, question: 'Is the current exhibition painting or sculpture?', options: ['Painting', 'Sculpture', 'Mixed Media'], answer: 'Mixed Media' }
                    ]
                },
                {
                    name: 'Cinema Radio',
                    description: 'Art Deco Masterpiece.',
                    detailedDescription: 'Built in the 1930s, this theater hosted Umm Kulthum and famous movie premieres. Visit the office complex inside.',
                    number: 3,
                    lat: 30.0500,
                    lng: 31.2420,
                    type: StopType.Monument_Landmark,
                    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
                    challenges: [
                        { title: 'Neon Sign', type: ChallengeType.PICTURE, points: 100, question: 'Capture the vertical neon sign.' }
                    ]
                },
                {
                    name: 'GrEeK Campus',
                    description: 'Tech Hub.',
                    detailedDescription: 'The former Greek school turned into a startup ecosystem. The vibe here is young, tech-savvy, and forward-looking.',
                    number: 4,
                    lat: 30.0430,
                    lng: 31.2380,
                    type: StopType.Facilities,
                    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
                    challenges: [
                        { title: 'Mural Hunt', type: ChallengeType.PICTURE, points: 80, question: 'Find the giant mural on the library wall.' }
                    ]
                },
                {
                    name: 'Aisha Fahmy Palace',
                    description: 'Zamalek Art Complex.',
                    detailedDescription: 'A stunning Italianate palace on the Nile, now an art center. The interiors are silk-lined and filled with frescos.',
                    number: 5,
                    lat: 30.0600,
                    lng: 31.2220,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1549495563-71a5c0b11fb9',
                    challenges: [
                        { title: 'Stained Glass', type: ChallengeType.LOCATION, points: 100, question: 'Find the stained glass window depicting the seasons.' }
                    ]
                },
                {
                    name: 'Cairo Tower',
                    description: 'The Lotus.',
                    detailedDescription: 'Designed to look like a lotus plant. It was the tallest structure in Africa for decades. The view at sunset is unbeatable.',
                    number: 6,
                    lat: 30.0459,
                    lng: 31.2243,
                    type: StopType.Viewpoint,
                    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
                    challenges: [
                        { title: 'Height', type: ChallengeType.TRIVIA, points: 50, question: 'How tall is the tower?', options: ['187m', '200m', '150m'], answer: '187m' }
                    ]
                },
                {
                    name: 'Cairo Opera House',
                    description: 'Cultural Beacon.',
                    detailedDescription: 'A gift from Japan. The hub of classical music and ballet in Cairo. Walk the grounds to see statues of famous Egyptians.',
                    number: 7,
                    lat: 30.0420,
                    lng: 31.2240,
                    type: StopType.Museum_Art,
                    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
                    challenges: [
                        { title: 'Statue ID', type: ChallengeType.TRIVIA, points: 50, question: 'Whose statue stands near the entrance?', options: ['Umm Kulthum', 'Naguib Mahfouz', 'Mohamed Abdel Wahab'], answer: 'Umm Kulthum' }
                    ]
                },
                {
                    name: 'Ataba Market (Book Market)',
                    description: 'Azbakeya Wall.',
                    detailedDescription: 'The oldest used book market in Cairo. Find rare first editions, old comics, and textbooks piled high.',
                    number: 8,
                    lat: 30.0520,
                    lng: 31.2480,
                    type: StopType.Shopping,
                    imageUrl: 'https://images.unsplash.com/photo-1526243741027-cdbe71e72acd',
                    challenges: [
                        { title: 'Oldest Book', type: ChallengeType.PICTURE, points: 150, question: 'Find a book published before 1960.' }
                    ]
                }
            ]
        }
    ];

    for (const tourData of tours) {
        console.log(`Creating tour: ${tourData.title}...`);

        const tour = await prisma.tour.create({
            data: {
                title: tourData.title,
                location: tourData.location,
                description: tourData.description,
                imageUrl: tourData.imageUrl,
                distance: tourData.distance,
                duration: tourData.duration,
                points: tourData.points,
                modes: tourData.modes,
                difficulty: tourData.difficulty,
                type: tourData.type,
                genre: tourData.genre,
                status: TourStatus.PUBLISHED,
                authorId: authorId,
                startLat: tourData.startLat,
                startLng: tourData.startLng,
            },
        });

        // Add Stops
        for (const stopData of tourData.stops) {
            const stop = await prisma.stop.create({
                data: {
                    tourId: tour.id,
                    name: stopData.name,
                    description: stopData.description,
                    detailedDescription: stopData.detailedDescription,
                    number: stopData.number,
                    latitude: stopData.lat,
                    longitude: stopData.lng,
                    type: stopData.type,
                    imageUrl: stopData.imageUrl,
                    pubgolfPar: stopData.pubgolfPar,
                    pubgolfDrink: stopData.pubgolfDrink,
                },
            });

            // Add Stop Challenges
            if (stopData.challenges) {
                for (const challenge of stopData.challenges) {
                    await prisma.challenge.create({
                        data: {
                            title: challenge.title,
                            type: challenge.type,
                            points: challenge.points,
                            content: challenge.question, // Map question -> content
                            options: challenge.options || [],
                            answer: challenge.answer,
                            stopId: stop.id,
                            tourId: tour.id,
                        },
                    });
                }
            }
        }

        // Add Global/Tour-wide Challenges
        if (tourData.globalChallenges) {
            for (const challenge of tourData.globalChallenges) {
                await prisma.challenge.create({
                    data: {
                        title: challenge.title,
                        type: challenge.type,
                        points: challenge.points,
                        content: challenge.question,
                        options: challenge.options || [],
                        answer: challenge.answer,
                        tourId: tour.id,
                        // No stopId for global challenges
                    },
                });
            }
        }
    }
}
