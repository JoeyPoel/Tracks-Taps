
import { paymentService } from '../backend/services/paymentService';
import { userService } from '../backend/services/userService';
import { prisma } from '../src/lib/prisma';
import axios from 'axios';

async function runTest() {
    console.log("🚀 Starting Token Purchase Verification Test (Manual Mock Mode)");

    // Manual Mocking of axios.get
    const originalGet = axios.get;
    let mockResponse: any = null;

    (axios as any).get = async (url: string, config: any) => {
        if (url.includes('api.revenuecat.com')) {
            return mockResponse;
        }
        return originalGet(url, config);
    };

    const testEmail = `test-user-${Date.now()}@example.com`;
    const testAuthId = `test-auth-${Date.now()}`;
    
    try {
        // 1. SIGN UP (Create User)
        console.log(`\nStep 1: Signing up test user: ${testEmail}`);
        const user = await userService.createUserByAuthId(testAuthId, testEmail);
        console.log(`✅ User created with ID: ${user.id}. Initial Tokens: ${user.tokens}`);

        if (user.tokens !== 0) throw new Error("Initial tokens should be 0");

        // 2. FIRST PURCHASE (Specific ID)
        console.log(`\nStep 2: Simulating FIRST purchase (10 tokens)...`);
        const txId1 = `tx-first-${Date.now()}`;
        
        mockResponse = {
            data: {
                subscriber: {
                    non_subscriptions: {
                        "tokens_10": [
                            { id: txId1, store_transaction_id: txId1, purchase_date: new Date().toISOString() },
                            { id: "old-sandbox-tx", store_transaction_id: "old-sandbox-tx", purchase_date: "2023-01-01T00:00:00Z" } 
                        ]
                    }
                }
            }
        };

        const result1 = await paymentService.verifyPurchase(user.id, testAuthId, 'ios', txId1);
        console.log(`✅ First verification result (newTokens): ${result1.newTokens}`);
        
        const userAfter1 = await prisma.user.findUnique({ where: { id: user.id } });
        console.log(`📊 Tokens after first purchase: ${userAfter1?.tokens}`);
        
        if (userAfter1?.tokens !== 10) {
            throw new Error(`Expected 10 tokens, but got ${userAfter1?.tokens}.`);
        }

        // 3. SECOND PURCHASE (Specific ID)
        console.log(`\nStep 3: Simulating SECOND purchase (10 tokens)...`);
        const txId2 = `tx-second-${Date.now()}`;
        
        mockResponse = {
            data: {
                subscriber: {
                    non_subscriptions: {
                        "tokens_10": [
                            { id: txId1, store_transaction_id: txId1, purchase_date: new Date().toISOString() },
                            { id: txId2, store_transaction_id: txId2, purchase_date: new Date().toISOString() },
                            { id: "old-sandbox-tx", store_transaction_id: "old-sandbox-tx", purchase_date: "2023-01-01T00:00:00Z" }
                        ]
                    }
                }
            }
        };

        const result2 = await paymentService.verifyPurchase(user.id, testAuthId, 'ios', txId2);
        console.log(`✅ Second verification result (newTokens): ${result2.newTokens}`);
        
        const userAfter2 = await prisma.user.findUnique({ where: { id: user.id } });
        console.log(`📊 Tokens after second purchase: ${userAfter2?.tokens}`);
        
        if (userAfter2?.tokens !== 20) {
            throw new Error(`Expected 20 tokens total, but got ${userAfter2?.tokens}.`);
        }

        // 4. VERIFY IDEMPOTENCY (Re-send same ID)
        console.log(`\nStep 4: Verifying IDEMPOTENCY (Re-sending txId2)...`);
        const result3 = await paymentService.verifyPurchase(user.id, testAuthId, 'ios', txId2);
        console.log(`✅ Idempotent verification result (newTokens): ${result3.newTokens}`);
        
        const userAfter3 = await prisma.user.findUnique({ where: { id: user.id } });
        if (userAfter3?.tokens !== 20 || result3.newTokens !== 0) {
            throw new Error(`Idempotency check failed! Tokens: ${userAfter3?.tokens}, New Tokens: ${result3.newTokens}`);
        }
        console.log(`✅ Idempotency confirmed.`);

        console.log(`\n🎉 ALL TESTS PASSED!`);
        console.log(`Summary: First and second purchases both awarded exactly 10 tokens each.`);

    } catch (error: any) {
        console.error(`\n❌ TEST FAILED:`, error.message || error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        (axios as any).get = originalGet; // Restore
    }
}

runTest();
