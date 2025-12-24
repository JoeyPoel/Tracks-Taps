
import { StopFormState } from '@/src/hooks/create/useStopForm';

export const validateStop = (
    state: StopFormState,
    isPubGolfEnabled: boolean,
    t: (key: string) => string
) => {
    const { name, isPubGolfStop, drink, par, marker } = state;

    if (!name || !marker) {
        return {
            valid: false,
            message: "Please select a location on the map and enter a name.",
            title: t('missingInfo')
        };
    }

    if (isPubGolfEnabled && isPubGolfStop && (!drink || !par)) {
        return {
            valid: false,
            message: "Please enter the drink and par for this Pub Golf stop.",
            title: t('missingInfo')
        };
    }

    return { valid: true };
};

export const createStopPayload = (
    state: StopFormState,
    isPubGolfEnabled: boolean
) => {
    const { name, description, detailedDescription, imageUrl, type, isPubGolfStop, drink, par, marker } = state;

    if (!marker) throw new Error("Marker is required to create a stop payload");

    return {
        name,
        description,
        detailedDescription,
        imageUrl,
        type,
        latitude: marker.latitude,
        longitude: marker.longitude,
        challenges: [],
        pubgolfDrink: (isPubGolfEnabled && isPubGolfStop) ? drink : null,
        pubgolfPar: (isPubGolfEnabled && isPubGolfStop) ? parseInt(par) : null,
    };
};
