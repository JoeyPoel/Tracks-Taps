
import { paymentService } from '@/backend/services/paymentService'; // Access backend service directly
// Note: In an Expo Router API route (server-side context), we can import anything from backend/

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, appUserId, transactionId } = body;

        if (!userId || !appUserId) {
            return Response.json({ error: "Missing userId or appUserId" }, { status: 400 });
        }

        console.log(`Verifying purchase for User:${userId} AppUser:${appUserId} Tx:${transactionId || 'Historical'}`);

        const result = await paymentService.verifyPurchase(Number(userId), appUserId, 'ios', transactionId);
        return Response.json(result);
    } catch (error: any) {
        // console.error("Verification endpoint error:", error);
        return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
