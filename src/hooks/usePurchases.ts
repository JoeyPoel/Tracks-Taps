
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { userService } from '../services/userService'; // Keep for tokens
import { useStore } from '../store/store'; // Keep for user context

// Use env variables for keys
// Falls back to the shared key if platform-specific ones aren't set
const SHARED_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY || 'test_taLApHZCoJTqPGUoTNvXCVlgGxq';

const API_KEYS = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || SHARED_KEY,
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || SHARED_KEY,
};

const ENTITLEMENT_ID = 'Tracks & Taps Pro'; // Matches user request

export const usePurchases = () => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isPro, setIsPro] = useState(false);
    const { user, fetchUser } = useStore();

    useEffect(() => {
        const initPurchases = async () => {
            try {
                if (Platform.OS === 'android') {
                    if (API_KEYS.google) await Purchases.configure({ apiKey: API_KEYS.google });
                } else {
                    if (API_KEYS.apple) await Purchases.configure({ apiKey: API_KEYS.apple });
                }

                // Enable debug logs
                await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                // Get Offerings
                const offerings = await Purchases.getOfferings();
                if (offerings.current && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                }

                // Check initial entitlement state
                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
                checkEntitlement(info);

                // Listen for updates (restores, purchases from other devices, etc.)
                Purchases.addCustomerInfoUpdateListener((info) => {
                    setCustomerInfo(info);
                    checkEntitlement(info);
                });

            } catch (e) {
                console.error("Error initializing RevenueCat", e);
            }
        };

        initPurchases();

        return () => {
            // Cleanup if needed (remove listener not strictly necessary with hook pattern if component unmounts, but good practice if exported)
        };
    }, []);

    const checkEntitlement = (info: CustomerInfo) => {
        if (info.entitlements.active[ENTITLEMENT_ID]) {
            setIsPro(true);
        } else {
            setIsPro(false);
        }
    };

    const purchasePackage = async (pack: PurchasesPackage) => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to purchase.");
            return false;
        }

        try {
            setIsPurchasing(true);
            const { customerInfo } = await Purchases.purchasePackage(pack);
            setCustomerInfo(customerInfo);
            checkEntitlement(customerInfo);

            // Verify Purchase on Backend (for tokens)
            // Ideally we check if pack is consumable or subscription
            const appUserId = customerInfo.originalAppUserId;

            // Only verify consummables on backend for token granting
            // Subscriptions are handled by RevenueCat + Entitlement check client side
            // But we can verify just in case
            const result = await userService.verifyPurchase(user.id, appUserId);

            if (result.success && result.newTokens > 0) {
                Alert.alert("Success", `You have purchased ${result.newTokens} tokens!`);
                await fetchUser(user.id);
            } else if (result.success && result.newTokens === 0) {
                // Maybe a subscription purchase or restore
                // Alert.alert("Info", "Purchase verified.");
            } else {
                // throw new Error("Verification failed on server.");
            }

            return true;
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert("Purchase Failed", e.message);
            }
            return false;
        } finally {
            setIsPurchasing(false);
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            checkEntitlement(info);
            if (info.entitlements.active[ENTITLEMENT_ID]) {
                Alert.alert("Success", "Your Pro subscription has been restored!");
            } else {
                Alert.alert("Info", "No active Pro subscription found to restore.");
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    return {
        packages,
        isPurchasing,
        customerInfo,
        isPro,
        restorePurchases,
        purchasePackage
    };
};
