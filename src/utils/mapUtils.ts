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
