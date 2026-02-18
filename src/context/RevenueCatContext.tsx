import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage, PurchasesStoreTransaction } from 'react-native-purchases';
import { useUserContext } from './UserContext';

// Your API Key
const API_KEY = 'test_wwsKPWQWYbkAswYCWwRyIrDevWw';

interface RevenueCatContextType {
    isPro: boolean;
    customerInfo: CustomerInfo | null;
    packages: PurchasesPackage[]; // Consumable packages (tokens)
    purchasePackage: (pkg: PurchasesPackage) => Promise<PurchasesStoreTransaction | null>;
    restorePurchases: () => Promise<void>;
    loading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserContext();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                if (Platform.OS === 'android') {
                    // Purchases.configure({ apiKey: API_KEY_GOOGLE }); 
                    // Assuming same key or user didn't provide Google key yet. 
                    // Using the provided key for both for now, but typically they differ.
                    Purchases.configure({ apiKey: API_KEY });
                } else {
                    Purchases.configure({ apiKey: API_KEY });
                }

                if (user?.id) {
                    await Purchases.logIn(String(user.id));
                }

                Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                const info = await Purchases.getCustomerInfo();
                setCustomerInfo(info);
                checkEntitlements(info);

                await loadOfferings();
            } catch (error) {
                console.error('RevenueCat init error', error);
            } finally {
                setLoading(false);
            }
        };

        init();

        const customerInfoUpdateListener = (info: CustomerInfo) => {
            setCustomerInfo(info);
            checkEntitlements(info);
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
        };
    }, []);

    // Login effect when user changes
    useEffect(() => {
        if (user?.id) {
            Purchases.logIn(String(user.id)).then(({ customerInfo }) => {
                setCustomerInfo(customerInfo);
                checkEntitlements(customerInfo);
            });
        }
    }, [user?.id]);

    const checkEntitlements = (info: CustomerInfo) => {
        if (info.entitlements.active['Tracks & Taps Pro']) {
            setIsPro(true);
        } else {
            setIsPro(false);
        }
    };

    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current && offerings.current.availablePackages.length !== 0) {
                setPackages(offerings.current.availablePackages);
            }
        } catch (error) {
            console.error('Error fetching offerings', error);
        }
    };

    const purchasePackage = async (pkg: PurchasesPackage): Promise<PurchasesStoreTransaction | null> => {
        try {
            const { transaction } = await Purchases.purchasePackage(pkg);
            return transaction;
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert('Purchase Error', error.message);
            }
            return null;
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            checkEntitlements(info);
            Alert.alert('Success', 'Purchases restored successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <RevenueCatContext.Provider
            value={{
                isPro,
                customerInfo,
                packages,
                purchasePackage,
                restorePurchases,
                loading,
            }}
        >
            {children}
        </RevenueCatContext.Provider>
    );
};

export const useRevenueCat = () => {
    const context = useContext(RevenueCatContext);
    if (!context) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
};
