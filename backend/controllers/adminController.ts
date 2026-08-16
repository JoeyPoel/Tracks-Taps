import { prisma } from '../../src/lib/prisma';
import { userRepository } from '../repositories/userRepository';
import { supabaseAdminRole } from '../utils/auth';

/**
 * Controller to handle administrative functionalities.
 */
export const adminController = {
    /**
     * Checks if the user with the given userId is an administrator.
     */
    async isUserAdmin(userId: number): Promise<boolean> {
        const user = await userRepository.getUserProfile(userId);
        return !!(user && user.isAdmin);
    },

    /**
     * Retrieves overall system statistics.
     */
    async getStats(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const [
                totalUsers,
                totalTours,
                activeToursCount,
                purchaseAgg,
                toursByStatus
            ] = await Promise.all([
                prisma.user.count(),
                prisma.tour.count(),
                prisma.activeTour.count(),
                prisma.purchase.aggregate({
                    _count: { id: true },
                    _sum: { tokens: true }
                }),
                prisma.tour.groupBy({
                    by: ['status'],
                    _count: { id: true }
                })
            ]);

            // Format tour status counts
            const tourStatusCounts: Record<string, number> = {
                DRAFT: 0,
                PENDING_REVIEW: 0,
                PUBLISHED: 0,
                REJECTED: 0
            };
            toursByStatus.forEach(group => {
                tourStatusCounts[group.status] = group._count.id;
            });

            return Response.json({
                users: totalUsers,
                tours: totalTours,
                activeSessions: activeToursCount,
                purchasesCount: purchaseAgg._count.id,
                tokensPurchased: purchaseAgg._sum.tokens || 0,
                tourStatusCounts
            });
        } catch (error: any) {
            console.error('Error fetching admin statistics:', error);
            return Response.json({ error: 'Failed to fetch admin stats', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves a list of tours that are pending review.
     */
    async getPendingTours(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const pendingTours = await prisma.tour.findMany({
                where: {
                    status: {
                        in: ['PENDING_REVIEW', 'REJECTED']
                    }
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    imageUrl: true,
                    distance: true,
                    duration: true,
                    points: true,
                    status: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                            isAdmin: true
                        }
                    },
                    stops: {
                        orderBy: { number: 'asc' },
                        select: {
                            id: true,
                            number: true,
                            name: true,
                            description: true,
                            longitude: true,
                            latitude: true,
                            type: true,
                            challenges: {
                                select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                    points: true,
                                    content: true,
                                    hint: true,
                                    answer: true,
                                    options: true
                                }
                            }
                        }
                    },
                    challenges: {
                        where: { stopId: null },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            points: true,
                            content: true,
                            hint: true,
                            answer: true,
                            options: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            return Response.json(pendingTours);
        } catch (error: any) {
            console.error('Error fetching pending tours:', error);
            return Response.json({ error: 'Failed to fetch pending tours', details: error.message }, { status: 500 });
        }
    },

    /**
     * Updates the status of a specific tour (e.g. approve/reject).
     */
    async updateTourStatus(request: Request, body: any) {
        const { userId, tourId, status, rejectionReason } = body;

        if (!userId || !tourId || !status) {
            return Response.json({ error: 'Missing required fields: userId, tourId, or status' }, { status: 400 });
        }

        if (status !== 'PUBLISHED' && status !== 'REJECTED') {
            return Response.json({ error: 'Invalid status. Must be PUBLISHED or REJECTED' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(Number(userId));
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const updatedTour = await prisma.tour.update({
                where: {
                    id: Number(tourId)
                },
                data: {
                    status,
                    rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    rejectionReason: true
                }
            });

            return Response.json({ success: true, tour: updatedTour });
        } catch (error: any) {
            console.error('Error updating tour status:', error);
            return Response.json({ error: 'Failed to update tour status', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves overall system users.
     */
    async getUsers(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));
        const query = searchParams.get('query') || '';

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    isAdmin: true,
                    createdAt: true,
                    xp: true,
                    tokens: true,
                    customTheme: true,
                    _count: {
                        select: {
                            createdTours: true,
                            playedTours: true,
                            reviews: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            return Response.json(users);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return Response.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves overall system reviews.
     */
    async getReviews(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));
        const query = searchParams.get('query') || '';

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const reviews = await prisma.review.findMany({
                where: {
                    OR: [
                        { content: { contains: query, mode: 'insensitive' } },
                        { tour: { title: { contains: query, mode: 'insensitive' } } },
                        { author: { name: { contains: query, mode: 'insensitive' } } }
                    ]
                },
                select: {
                    id: true,
                    content: true,
                    rating: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    tour: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            return Response.json(reviews);
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            return Response.json({ error: 'Failed to fetch reviews', details: error.message }, { status: 500 });
        }
    },

    /**
     * Toggles the admin status of a user.
     */
    async toggleUserAdmin(request: Request, body: any) {
        const { userId, targetUserId, isAdmin } = body;

        if (!userId || !targetUserId || isAdmin === undefined) {
            return Response.json({ error: 'Missing required fields: userId, targetUserId, or isAdmin' }, { status: 400 });
        }

        if (Number(userId) === Number(targetUserId)) {
            return Response.json({ error: 'Cannot toggle your own admin status' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const updatedUser = await prisma.user.update({
                where: { id: Number(targetUserId) },
                data: { isAdmin: !!isAdmin },
                select: {
                    id: true,
                    name: true,
                    isAdmin: true
                }
            });

            return Response.json({ success: true, user: updatedUser });
        } catch (error: any) {
            console.error('Error toggling user admin:', error);
            return Response.json({ error: 'Failed to toggle user admin status', details: error.message }, { status: 500 });
        }
    },

    /**
     * Deletes a user account completely (anonymizing tours, deleting relation data).
     */
    async deleteUser(request: Request, body: any) {
        const { userId, targetUserId } = body;

        if (!userId || !targetUserId) {
            return Response.json({ error: 'Missing required fields: userId or targetUserId' }, { status: 400 });
        }

        if (Number(userId) === Number(targetUserId)) {
            return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const deletedUser = await userRepository.deleteUser(Number(targetUserId));
            
            if (deletedUser && deletedUser.authId && supabaseAdminRole) {
                try {
                    const { error } = await supabaseAdminRole.auth.admin.deleteUser(deletedUser.authId);
                    if (error) {
                        console.error('Failed to delete user from Supabase Auth:', error);
                    } else {
                        console.log(`Successfully deleted user ${deletedUser.authId} from Supabase Auth`);
                    }
                } catch (err) {
                    console.error('Failed to delete user from Supabase Auth (caught):', err);
                }
            }

            return Response.json({ success: true, message: 'User deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return Response.json({ error: 'Failed to delete user', details: error.message }, { status: 500 });
        }
    },

    /**
     * Deletes a specific review.
     */
    async deleteReview(request: Request, body: any) {
        const { userId, reviewId } = body;

        if (!userId || !reviewId) {
            return Response.json({ error: 'Missing required fields: userId or reviewId' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            await prisma.review.delete({
                where: { id: Number(reviewId) }
            });

            return Response.json({ success: true, message: 'Review deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting review:', error);
            return Response.json({ error: 'Failed to delete review', details: error.message }, { status: 500 });
        }
    },

    /**
     * Updates details of a user.
     */
    async updateUser(request: Request, body: any) {
        const { userId, targetUserId, name, email, tokens, xp, customTheme } = body;

        if (!userId || !targetUserId) {
            return Response.json({ error: 'Missing userId or targetUserId' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const dataToUpdate: any = {};
            if (name !== undefined) dataToUpdate.name = name;
            if (email !== undefined) dataToUpdate.email = email || null;
            if (tokens !== undefined) dataToUpdate.tokens = Number(tokens);
            if (customTheme !== undefined) dataToUpdate.customTheme = customTheme || null;
            if (xp !== undefined) {
                const newXp = Number(xp);
                dataToUpdate.xp = newXp;

                // Auto compute level on backend based on cumulative XP
                let level = 1;
                let currentXp = newXp;
                const base_xp = 500;
                const multiplier = 1.2;

                const getXpForLevel = (lvl: number) => {
                    if (lvl < 1) return 0;
                    const rawXp = base_xp * Math.pow(multiplier, lvl - 1);
                    if (rawXp >= 10000) {
                        return Math.round(rawXp / 1000) * 1000;
                    }
                    return Math.max(500, Math.round(rawXp / 500) * 500);
                };

                let xpNeeded = getXpForLevel(level);
                while (currentXp >= xpNeeded) {
                    currentXp -= xpNeeded;
                    level++;
                    xpNeeded = getXpForLevel(level);
                }
                dataToUpdate.level = level;
            }

            const updatedUser = await prisma.user.update({
                where: { id: Number(targetUserId) },
                data: dataToUpdate,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    isAdmin: true,
                    createdAt: true,
                    xp: true,
                    tokens: true,
                    customTheme: true,
                    _count: {
                        select: {
                            createdTours: true,
                            playedTours: true,
                            reviews: true
                        }
                    }
                }
            });

            return Response.json({ success: true, user: updatedUser });
        } catch (error: any) {
            console.error('Error updating user:', error);
            return Response.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
        }
    },

    /**
     * Reads and returns the contents of TOUR_GENERATOR.md.
     */
    async getPrompt(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const fs = require('fs');
            const path = require('path');
            
            // Try resolving in multiple locations (e.g. process.cwd() and relative paths)
            const pathsToTry = [
                path.join(process.cwd(), 'TOUR_GENERATOR.md'),
                path.join(__dirname, '..', '..', 'TOUR_GENERATOR.md'),
                path.join(__dirname, 'TOUR_GENERATOR.md')
            ];
            
            let prompt = '';
            for (const p of pathsToTry) {
                try {
                    if (fs.existsSync(p)) {
                        prompt = fs.readFileSync(p, 'utf8');
                        break;
                    }
                } catch (e) {
                    console.warn(`Failed to read from path: ${p}`, e);
                }
            }

            if (!prompt) {
                console.warn("Could not find TOUR_GENERATOR.md on disk. Using bundled fallback prompt.");
                prompt = ` # ROLE
You are a Senior Geospatial Engineer and Game Systems Designer. You specialize in generating complex, production-ready JSON for gamified urban tours.

# 1. GEOSPATIAL PRECISION & VERIFICATION (MANDATORY SEARCH, QUOTE & REPLACE)
**CRITICAL SYSTEM INSTRUCTION:** You do NOT have exact 5-decimal coordinates memorized. If you rely on internal memory, you will hallucinate the numbers and break the game routing. You MUST use your built-in Google Search tool to find real-time data before writing any JSON. Follow this exact sequence without deviation:

- **STEP 1 (STRICT WIKIDATA/OSM SEARCH):** For each planned stop, you must use your Google Search tool to find the specific "Wikidata P625" (coordinate property) or the "OpenStreetMap Node". Do NOT search for general tourist info. Search explicitly for exact decimal coordinates.
- **STEP 2 (MANDATORY QUOTE EXTRACTION):** Before writing ANY JSON, you MUST print a verification list. For every stop, provide the exact URL you found and visually QUOTE the text snippet containing the coordinates. 
  - *Example:* "Stop 1: The Rijksmuseum. Found on wikidata.org. Quote: 'Coordinate location: 52.35999, 4.88522'."
  - **CRITICAL FAIL-SAFE (AUTO-REPLACE):** If you search and cannot find a text snippet with exact 5-decimal numbers for a planned stop, DO NOT GUESS and DO NOT HALT. You must discard that location entirely, select a *new* relevant location for the tour, and execute a new search. Repeat this process until you have successfully found and quoted verified coordinates for the exact number of stops requested.
- **STEP 3 (JSON GENERATION):** ONLY AFTER you have printed the complete verification list for all required stops, generate the final JSON block. Inject the exact quoted numbers into the \`latitude\` and \`longitude\` fields.
- **STEP 4 (DISTANCE & DURATION):** Calculate the real walking distance between all verified coordinates in km. Calculate duration using this formula: (Total distance / 5km/h) + (3 minutes per challenge) + (5 minutes per stop). 
- **STEP 5 (PATH LOGIC):** Sequential verified stops must be within 300m - 600m of each other, forming a logical, walkable path.

# 2. CONTENT HIERARCHY & EDUCATIONAL VALUE (NO AI-SLOP)
Every stop and challenge must follow these strict content rules:
- **Stop \`description\`**: Exactly 1 short, punchy sentence acting as a teaser for the location. Banned: "Welcome to...", "Nestled in...", "A historic...". Make it intriguing and active.
- **Stop \`detailedDescription\`**: At least 2 robust paragraphs (4-6 sentences each) packed with specific historical facts, architectural quirks, local legends, or hidden history. The player MUST learn something genuinely surprising or interesting. 
  - *No Generic Clichés:* Do NOT use generic phrases like "testament to the passage of time", "vibrant hub", "rich history", "must-visit", "stunning example", "nestled in the heart of".
  - *Specific Details Required:* If it's a pub/restaurant, specify its founding date, famous historical patrons, and specific signature items (e.g. types of local ale or dishes served). If it's a monument/building, mention the specific architect, style (e.g. Neo-Gothic, Brutalist), materials used, and any controversies or hidden symbols. For parks, mention the design origin, unique species, or historical events that occurred there. Provide raw, fascinating information, not marketing copy.
- **Challenge \`title\`**: A short & catchy 2-4 word "hook" (e.g., "The Iron Secret", "Gargoyle's Gaze").
- **Challenge \`content\`**: The actual payload (question, riddle, dare). *Never repeat the title here.*

# 3. CHALLENGE CREATIVITY & VARIETY (DITCH THE SLOP)
Challenges must be highly engaging, interactive, and feel designed by a human game developer, not an AI template. Banish boring "What year..." or "Look at the plaque..." questions.
- **TRIVIA**: Focus on weird historical events, eccentric historical figures associated with the spot, or obscure architectural oddities. Avoid easily guessable multiple-choice options.
- **RIDDLE**: Write evocative, poetic, or atmospheric riddles pointing to a specific, physical detail of the stop that the player has to look around to solve.
- **LOCATION**: Turn it into a mini-scavenger hunt. (e.g., "Find the small bronze lizard hidden on the doorframe", "Locate the stone marker showing the 1953 flood level").
- **PICTURE**: Require creative and funny framing. (e.g., "Pose like the central figure of the monument", "Find the oldest-looking piece of graffiti/carving and snap a close-up", "Take a photo aligning your friend's head with the church spire").
- **DARE**: Fun, low-friction interactions. (e.g., "Find a local and ask them to name their favorite hidden spot nearby", "Walk backwards across the historical bridge", "Rate the smell of the nearby bakery on a scale of 1-10").
- **Bingo / Bonus Challenges**: These must be widely applicable to the city/route but require observant eyes (e.g., "Spot a bicycle with a wicker basket", "Find a building with a year older than 1850 carved on its facade").

# 4. QUANTITY, VARIETY & LOGISTICS
- **Stops**: Generate the exact number of stops specified in the User Input. If left empty, default to generating 8 to 12 stops.
- **Stop Types (Strict Enum)**: The \`type\` string for each stop MUST exactly match one of these strict values: \`Food_Dining\`, \`Coffee_Drink\`, \`Nightlife\`, \`Museum_Art\`, \`Monument_Landmark\`, \`Religious\`, \`Nature_Park\`, \`Shopping\`, \`Transit_Stop\`, \`Viewpoint\`, \`Info_Point\`, \`Facilities\`. Do not invent new types.
- **Challenges Per Stop**: Every stop must have 1 to 3 challenges.
- **Challenge Types**: Use \`TRIVIA\`, \`LOCATION\`, \`PICTURE\`, \`RIDDLE\`, and \`DARE\`.
- **Modes**: Always include "WALKING" (or "BIKING"). If Bingo is enabled, include "BINGO" in the \`modes\` array.
- **Pubgolf Mode**: If enabled, every stop needs a \`pubgolfPar\` (1-5) and a \`pubgolfDrink\`. If disabled, set to \`null\`.

# 5. DATA INTEGRITY, MEDIA & SMART ID GENERATION
- **Collision-Proof IDs**: To prevent database collisions, generate highly random 6-digit integers (e.g., 492817) for EVERY \`id\` field (Tour, Stops, Challenges). Do NOT use small sequential numbers.
- **Math Consistency**: The top-level \`points\` field MUST be the mathematical sum of all challenge points (both nested and root-level). 
- **Image Verification**: If you add an \`imageUrl\` anywhere, you MUST verify it is a live, working link. If you cannot guarantee the URL's validity or permanence, you must leave the string entirely empty (\`""\`). Do not guess or hallucinate image links.
- **Reviews**: The \`reviews\` array must be left completely empty (\`[]\`). Consequently, \`_count.reviews\` and \`reviewCount\` must be exactly \`0\`, and \`averageRating\` should be \`0.0\`.
- **Count Objects**: Ensure \`_count.stops\` matches the actual stop array length. 
- **Start Latitude & Longitude**: Ensure Start Latitude & Longitude matches the first stop's latitude & longitude.
- **City**: The city name should be in the format "City, Province / State" (e.g., "Amsterdam, North Holland").
- **Genre**: The genre should match one of: 'Adventure', 'History', 'Nature', 'Nightlife', 'Culture', 'Foodie', 'Romance', 'Art', 'Photography', 'Mystery'.
- **Modes**: Always include "WALKING". If Bingo is enabled, include "BINGO" in the \`modes\` array, if pubgolf is enabled, include "PUBGOLF" in the \`modes\` array, if driving is necessary, include "DRIVING" in the \`modes\` array, if public transport is necessary, include "PUBLIC_TRANSPORT" in the \`modes\` array. if biking is necessary, include "BIKING" in the \`modes\` array.
- **Difficulty**: The difficulty should match one of: 'EASY', 'MEDIUM', 'HARD'.
- **Points per stop**: Points should always be 50 to 200.
- **Points per bonus challenge**: Points should always be 50 to 200.
- **Points per bingo challenge**: Points should always be 50 to 200.
- **Points can never be below 50**: Never go below 50 points per challenge, and keep it close to the 50-200 range.
- **Total amount of points**: Total amount of points should always be all challenge points added up + 200 for every pubgolf stop.
- **Challenges**: Should always be written in a fun language and should be engaging and interesting. No words as must, should be encouraging and fun to read.
- **Bingo Challenges**: Should always be written in a fun language and should be engaging and interesting. No words as must, should be encouraging and fun to read.
- **Bonus Challenges**: Should always be written in a fun language and should be engaging and interesting. No words as must, should be encouraging and fun to read.

# MASTER JSON TEMPLATE
\`\`\`json
{
  "id": [Random 6-Digit Int],
  "title": "",
  "location": "",
  "description": "",
  "imageUrl": "",
  "distance": [Calculated Float],
  "duration": [Calculated Int],
  "points": [SUM OF ALL CHALLENGE POINTS],
  "modes": ["WALKING", "BIKING", "BINGO","PUBGOLF","DRIVING","PUBLIC_TRANSPORT"], 
  "difficulty": "MEDIUM",
  "status": "PENDING_REVIEW",
  "type": "QUICK_TRIP",
  "genre": "Adventure",
  "startLat": 0.00000,
  "startLng": 0.00000,
  "createdAt": "2026-02-20T12:00:00.000Z",
  "author": { "id": 11, "name": "Expert Architect", "avatarUrl": "", "level": 5 },
  "stops": [
    {
      "id": [Random 6-Digit Int],
      "number": 1,
      "name": "",
      "description": "[Exactly 1 short sentence]",
      "detailedDescription": "[At least 1 detailed paragraph of historical/interesting facts]",
      "imageUrl": "",
      "latitude": 0.00000,
      "longitude": 0.00000,
      "type": "Monument_Landmark",
      "pubgolfPar": null,
      "pubgolfDrink": null,
      "challenges": [
        {
          "id": [Random 6-Digit Int],
          "title": "[Short Hook]",
          "type": "TRIVIA",
          "points": [50-250],
          "content": "[Question/Instruction]",
          "hint": "",
          "answer": "",
          "options": ["A", "B", "C", "D"],
          "bingoRow": null,
          "bingoCol": null
        }
      ]
    }
  ],
  "challenges": [ 
    /* 2-3 BONUS CHALLENGES GO HERE ALWAYS */
    /* AND 9 BINGO CHALLENGES GO HERE IF ENABLED */
    {
        "id": [Random 6-Digit Int],
        "title": "Neon Lights",
        "type": "PICTURE",
        "points": 100,
        "content": "Take a picture of a neon sign along your route.",
        "hint": "Look closely at bars!",
        "answer": "",
        "options": [],
        "bingoRow": 0,
        "bingoCol": 1
    }
  ],
  "reviews": [],
  "_count": {
    "reviews": 0,
    "stops": [Match Array Length]
  },
  "averageRating": 0.0,
  "reviewCount": 0
}
\`\`\`

# USER INPUT
- City: 
- Theme: 
- Number of Stops: [Leave empty for default 8-12, or specify an exact number]
- Pubgolf: [YES / NO]
- Bingo: [YES / NO]
- Language: 
- Additional Instructions:`;
            }
            
            return Response.json({ prompt });
        } catch (error: any) {
            console.error('Error reading prompt file:', error);
            return Response.json({ error: 'Failed to read prompt file', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves the recent purchase records.
     */
    async getPurchases(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const purchases = await prisma.purchase.findMany({
                orderBy: {
                    purchasedAt: 'desc'
                },
                take: 100,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            return Response.json(purchases);
        } catch (error: any) {
            console.error('Error fetching purchases:', error);
            return Response.json({ error: 'Failed to fetch purchases', details: error.message }, { status: 500 });
        }
    },
    async deleteTour(request: Request, body: any) {
        const { userId, tourId } = body;

        if (!userId || !tourId) {
            return Response.json({ error: 'Missing required fields: userId or tourId' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const { tourService } = require('../services/tourService');
            await tourService.deleteTour(Number(tourId));
            return Response.json({ success: true, message: 'Tour deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting tour:', error);
            return Response.json({ error: 'Failed to delete tour', details: error.message }, { status: 500 });
        }
    }
};

