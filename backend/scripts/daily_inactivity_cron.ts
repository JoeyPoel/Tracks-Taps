import { prisma } from '../../src/lib/prisma';
import { sendExpoPushNotifications } from '../utils/pushSender';
import * as dotenv from 'dotenv';

dotenv.config();

const ENGAGEMENT_MESSAGES = [
    "Discover new tours available in the app.",
    "Check out the latest tracks added this week.",
    "Open Tracks and Taps to view your profile updates."
];

async function main() {
    console.log('[daily_inactivity_cron] Starting inactivity re-engagement check...');

    // Select users inactive for >= 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const inactiveUsers = await prisma.user.findMany({
        where: {
            lastActiveAt: {
                lte: threeDaysAgo
            }
        },
        include: {
            pushTokens: true
        }
    });

    console.log(`[daily_inactivity_cron] Found ${inactiveUsers.length} inactive users.`);

    const messagesToSend: any[] = [];

    for (const user of inactiveUsers) {
        if (!user.pushTokens || user.pushTokens.length === 0) continue;

        // Choose random notification message from the engagement pool
        const randomBody = ENGAGEMENT_MESSAGES[Math.floor(Math.random() * ENGAGEMENT_MESSAGES.length)];

        user.pushTokens.forEach(t => {
            messagesToSend.push({
                to: [t.pushToken],
                title: 'Tracks & Taps',
                body: randomBody,
                data: { screen: 'explore' }
            });
        });
    }

    if (messagesToSend.length > 0) {
        console.log(`[daily_inactivity_cron] Dispatching ${messagesToSend.length} push notifications...`);
        await sendExpoPushNotifications(messagesToSend);
    } else {
        console.log('[daily_inactivity_cron] No push notifications to send.');
    }
}

main()
    .catch((e) => {
        console.error('[daily_inactivity_cron] Failed to execute cron script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
