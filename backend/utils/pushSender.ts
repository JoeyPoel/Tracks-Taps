import axios from 'axios';
import { prisma } from '@/src/lib/prisma';

interface PushMessage {
    to: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
}

export async function sendExpoPushNotifications(messages: PushMessage[]) {
    const chunks = chunkArray(messages, 100);

    for (const chunk of chunks) {
        try {
            const response = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
            });

            // Handle receipts and prune invalid tokens
            const tickets = response.data?.data;
            if (tickets) {
                for (let i = 0; i < tickets.length; i++) {
                    if (tickets[i].status === 'error' && tickets[i].details?.error === 'DeviceNotRegistered') {
                        const staleToken = chunk[i].to[0];
                        await prisma.userPushToken.deleteMany({
                            where: { pushToken: staleToken },
                        });
                        console.log(`[pushSender] Pruned stale token: ${staleToken}`);
                    }
                }
            }
        } catch (error) {
            console.error('[pushSender] Error dispatching push notifications:', error);
        }
    }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );
}
