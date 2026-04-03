
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { userService } from '../services/userService'; // Keep for tokens
import { useStore } from '../store/store'; // Keep for user context
import { useLanguage } from '../context/LanguageContext';

// Use env variables for keys
// Falls back to the shared key if platform-specific ones aren't set
const API_KEYS = {
    apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
};

const ENTITLEMENT_ID = 'Tracks & Taps Pro'; // Matches user request

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const usePurchases = () => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const { user, fetchUser } = useStore();

    useEffect(() => {
        const initPurchases = async () => {
            if (isExpoGo || Platform.OS === 'web') {
                console.warn("Skipping RevenueCat configuration: Not supported in Expo Go or Web. Please create a development build to test in-app purchases.");
                return;
            }

            try {
                const isDev = __DEV__;
                const isAndroidTestKey = Platform.OS === 'android' && API_KEYS.google?.startsWith('test_');

                if (isDev || isAndroidTestKey) {
                    console.log(`[usePurchases] Skipping initialization: dev=${isDev}, isAndroidTestKey=${isAndroidTestKey}`);
                    return;
                }

                if (Platform.OS === 'android') {
                    if (API_KEYS.google) await Purchases.configure({ apiKey: API_KEYS.google });
                } else {
                    if (API_KEYS.apple) await Purchases.configure({ apiKey: API_KEYS.apple });
                }

                setIsConfigured(true);

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

    // Sync RevenueCat user ID with our database ID
    useEffect(() => {
        if (isConfigured && user) {
            Purchases.logIn(user.id.toString()).catch(err =>
                console.error("Error logging into RevenueCat:", err)
            );
        }
    }, [isConfigured, user?.id]);

    const { t } = useLanguage();

    const checkEntitlement = (info: CustomerInfo) => {
        if (info.entitlements.active[ENTITLEMENT_ID]) {
            setIsPro(true);
        } else {
            setIsPro(false);
        }
    };

    const purchasePackage = async (pack: PurchasesPackage, tokenCount: number) => {
        if (isExpoGo) {
            Alert.alert("Development Build Required", "In-app purchases are not available in Expo Go. You must create a development build to test this feature.");
            return false;
        }

        if (!isConfigured) {
            Alert.alert("Store Unavailable", "RevenueCat is not configured correctly.");
            return false;
        }

        if (!user) {
            Alert.alert("Error", "You must be logged in to purchase.");
            return false;
        }

        try {
            setIsPurchasing(true);
            const { customerInfo, transaction } = await Purchases.purchasePackage(pack);
            setCustomerInfo(customerInfo);
            checkEntitlement(customerInfo);

            // 1. Immediate UI Feedback
            console.log("Purchase successful, verifying on backend...");

            const transactionId = transaction.transactionIdentifier;

            // 2. Manual Verification (Immediate Token Award)
            try {
                const result = await userService.verifyPurchase(user.id, user.id.toString(), transactionId);

                // Always show the standardized message with the token count we know was bought
                Alert.alert(
                    t('purchaseSuccessTitle'),
                    t('tokensPurchasedMessage').replace('{0}', (result.newTokens || tokenCount).toString())
                );
                await fetchUser(user.id);

            } catch (verifyError) {
                console.warn("Manual verification failed, but purchase was successful. Webhook will handle delivery.", verifyError);
                // Standardized message even on failure (fallback to expected token count)
                Alert.alert(
                    t('purchaseSuccessTitle'),
                    t('tokensPurchasedMessage').replace('{0}', tokenCount.toString())
                );
                // Background refresh after a short delay as a fallback
                setTimeout(() => fetchUser(user.id), 3000);
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
        if (isExpoGo) {
            Alert.alert("Development Build Required", "In-app purchases are not available in Expo Go. You must create a development build to test this feature.");
            return;
        }

        if (!isConfigured) {
            Alert.alert("Store Unavailable", "RevenueCat is not configured correctly.");
            return;
        }

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
