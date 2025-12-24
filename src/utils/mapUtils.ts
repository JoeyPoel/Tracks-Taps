import { Linking, Platform } from 'react-native';

export const openMapApp = async (lat: number, lng: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });

    const url = Platform.select({
        ios: `${scheme}${label}@${lat},${lng}`,
        android: `${scheme}${lat},${lng}(${label})`
    });

    if (url) {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback to Google Maps web URL
                const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                await Linking.openURL(browserUrl);
            }
        } catch (error) {
            console.error("An error occurred", error);
            // Fallback to Google Maps web URL in case of error
            const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            await Linking.openURL(browserUrl);
        }
    }
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};
